const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "St3ng12!",
  database: "nodelogin",
});

module.exports = db;
