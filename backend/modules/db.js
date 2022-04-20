const mysql = require("mysql");

const database = "nodelogin";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "St3ng12!",
  database,
});

module.exports = { db, database };
