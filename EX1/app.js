/**
 * Name: Roy Goldrecih
 *
 * ID: 208385757
 * 
 * Parking lot manager
 */
 const express = require('express');
 const bodyParser = require('body-parser');

 const appRoutes = require('./routes/routes');
 const db = require('./util/database');
const connection = require('./util/database');
 const app = express();

 

 app.use(bodyParser.urlencoded({
     extended:true
 }));
 
 app.use('/', appRoutes);



 db.connect(function(err){
        if (err){
            
            console.log("connection error error"+err);
        } else {
            console.log("I Connected");
        }
    })

     //Create database, if not exists.
 db.query("CREATE DATABASE IF NOT EXISTS Parks", (err) => {
    if(err){
        console.log("There was an error creating the Database"err);
    }
    else{
        console.log("Parks exists !");
    }
})
    
    //Build tickets table, if does not exist
    const sql = `CREATE TABLE IF NOT EXISTS Parks.tickets (
        ticketId INT UNSIGNED NOT NULL AUTO_INCREMENT,
        plate VARCHAR(11) NOT NULL,
        lotId INT UNSIGNED NOT NULL,
        entry_time DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        exit_time DATETIME NULL ,
        PRIMARY KEY (ticketId),
        UNIQUE INDEX ticketId_UNIQUE (ticketId ASC))`; 
    console.log("Building Database table");
    db.query(sql,(err,res) => {
        if(err){
            console.log("ERROR Building table"+err)
        } else{
            console.log("Database table created" + res);
        }
    })
    
    console.log("Finished with table");
    
 app.listen(8080);
 