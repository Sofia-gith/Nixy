import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pedro@0804",
  database: "nixy_db"
});

export const db = connection.promise();