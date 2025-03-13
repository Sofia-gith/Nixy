import mysql from "sql"

export const db = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"@root123fatec",
    database:"0"
    
})