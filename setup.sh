#!/bin/bash
KEY_NAME="Safe_key_aws"
KEY_PEM="$KEY_NAME.pem"
echo "create key pair $KEY_PEM to connect to instances and save locally"
aws ec2 create-key-pair --key-name $KEY_NAME | jq -r ".KeyMaterial" >$KEY_PEM

chmod 400 $KEY_PEM

SEC_GRP="my-sg"

echo "setup firewall $SEC_GRP"

aws ec2 create-security-group --group-name $SEC_GRP --description "Allow acsses"

MY_IP=$(curl ipinfo.io/ip)

echo "MY IP: $MY_IP"

echo "Allow SSH from MY IP ONLY"

aws ec2 authorize-security-group-ingress --group-name $SEC_GRP --port 22 --protocol tcp --cidr $MY_IP/32
USERNAME=$(aws configure get master_username)
PASSWORD=$(aws configure get master_password)

echo "Creating RDS instance"
DB_INSTANCE=$(aws rds  create-db-instance --db-instance-identifier mysql-instance --publicly-accessible --db-instance-class db.t2.micro --engine mysql --allocated-storage 20 --master-username $USERNAME --master-user-password $PASSWORD)
#Save connection details as enviorment variables to connect
#Wait for endpoint to be established
echo "Waiting for RDS DB Creation"
aws rds  wait db-instance-available --db-instance-identifier  mysql-instance
echo "RDS created"
#Add to secruty grop
#RUN_ID=$( aws sts get-caller-identity | jq -r .UserId)
#aws rds authorize-db-security-group-ingress --db-security-group-name default --ec2-security-group-name $SEC_GRP \
#--ec2-security-group-owner-id $RUN_ID

#Save important data
Description=$(aws rds describe-db-instances --db-instance-identifier mysql-instance)
Port=$(echo $Desription  | jq  .DBInstances[0].Endpoint.Port)
Address=$(echo $Description  | jq  .DBInstances[0].Endpoint.Address)

echo "HOST_DOM=$Address" >>./EX1/vars.sh
echo "DB_PORT=3306" >>./EX1/vars.sh
echo "DB_PASSWORD=$PASSWORD" >>./EX1/vars.sh
echo "DB_USERNAME=$USERNAME" >>./EX1/vars.sh
UBUNTU_20_04_AMI="ami-00399ec92321828f5"

echo "Creating Ubuntu 20.04 instace"
RUN_INSTANCES=$(aws ec2 run-instances --image-id $UBUNTU_20_04_AMI --instance-type t3.micro --key-name $KEY_NAME --security-groups $SEC_GRP)

INSTANCE_ID=$(echo $RUN_INSTANCES |jq -r '.Instances[0].InstanceId')

echo "Waiting for instance creation ..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID | jq -r '.Reservations[0].Instances[0].PublicIpAddress')

echo "New instance  $INSTANCE_ID@$PUBLIC_IP"

echo "Setup rule to allow comuncation to rds-db"
aws ec2 authorize-security-group-ingress --group-name $SEC_GRP --port 3306 --protocol tcp --source-group $SEC_GRP

echo "setup rule allowing SSH access to $MY_IP only"
aws ec2 authorize-security-group-ingress        \
    --group-name $SEC_GRP --port 22 --protocol tcp \
    --cidr $MY_IP/32
echo "setup rule allowing HTTP (port 8080) access to $MY_IP only"
aws ec2 authorize-security-group-ingress        \
    --group-name $SEC_GRP --port 8080 --protocol tcp \
    --cidr $MY_IP/32
echo "deploying code to production"
scp -r -i "$KEY_PEM" -o "StrictHostKeyChecking=no" -o "ConnectionAttempts=60" ./EX1 ubuntu@$PUBLIC_IP:/home/ubuntu

echo "setup production environment"
ssh -i "$KEY_PEM" -o "StrictHostKeyChecking=no" -o "ConnectionAttempts=10" ubuntu@$PUBLIC_IP <<EOF
    sudo apt-get -y update
    sudo apt-get -y upgrade
    sudo apt install --assume-yes nodejs
    sudo apt install --assume-yes npm
    cd EX1
    bash vars.sh
    npm install
    sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080
    node app.js
    exit
EOF

