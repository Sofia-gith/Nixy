import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "nixy"
});

export const db = connection.promise();