const mysql = require("mysql");
require("dotenv").config();

const database = "nodelogin";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database,
});

module.exports = { db, database };
