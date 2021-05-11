const db = require('../util/database');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * Registers an entry to a parking lot
 */
exports.entry = (req,res,next) =>{
 
    const  plate = req.query.plate;
    const lotId = req.query.parkingLot;
    console.log("plate is" + plate);
    console.log("lot is" + lotId);

    //register entry in database
    const sql =`INSERT INTO Parks.tickets (plate, lotId) VALUES (?,?);`
    db.connect(function(err,res){
        if (err){
            
            console.log("connection error error"+err);
        } else {
            console.log("I Connected" + res);
        }
    })
    db.query(sql,[plate,lotId],(err,result) =>{
        if(err){
            console.log("Error recording park!");
            console.log(err);
        } else{
            console.log("Registerd parking correctly");
            const ticketId =  result.insertId;
            res.status(201).json({
                message:"Car registerd",
                id: ticketId
            })
        }
    })
}

exports.exit =(req,res,next) => {
    const ticketId = req.query.ticketId;

    //Use ticket ID to get data from database server.
    const sql = "SELECT timestampdiff(MINUTE,entry_time, NOW()), plate,lotId FROM Parks.tickets WHERE ticketID = ?;";
    //Calculate time passed and amount of money
    db.connect(function(err,res){
        if (err){
            
            console.log("connection error error"+err);
        } else {
            console.log("I Connected" + res);
        }
    })
    db.query(sql,ticketId,(err,result) =>{
        if(err){
            console.log("Error recording park!");
            console.log(err);
        } else{
            console.log();
            console.log();
            //Parse response
            const time = result[0]['timestampdiff(MINUTE,entry_time, NOW())'] /15;
            const price = time * 10;
            const plate = result[0]['plate'];
            const lotId = result[0]['lotId'];
            //Return response
            res.status(200).json({
                price: price,
                plate:plate,
                lotID:lotId

            });
            }
        });
    
    }