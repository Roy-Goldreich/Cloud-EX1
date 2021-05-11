const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host:"database-1.cstlcqm0bmbz.us-east-2.rds.amazonaws.com", //the AWS endpoint
//     user:"admin", //Master User
//     password:"mpAftG5SWgd9Sr3npzXm", //Master Password
//     port:3306, //Database port
//     database: "database-1" //Database name
// });

/**
 * Need to set all of these to enviorment variables.
 */
const db_host = process.env.HOST_DOM;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_port = process.env.DB_PORT;

const connection = mysql.createConnection({
    // host:"database-1.cstlcqm0bmbz.us-east-2.rds.amazonaws.com", //the AWS endpoint
    // user:"admin", //Master User
    // password:"mpAftG5SWgd9Sr3npzXm", //Master Password
    // port:3306, //Database port
    // //database: "database-1" //Database name
    host:db_host,
    user:db_user,
    password:db_password,
    port:db_port
})
module.exports = connection;