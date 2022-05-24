const mysql = require("mysql");
require("dotenv").config({ path: "./config/config.env" });

const database = "nodelogin";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database,
});

module.exports = { db, database };
