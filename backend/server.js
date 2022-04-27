const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { db } = require("./modules/db");

const app = express();
const port = 5000;

app.use(session({ secret: "super-secret" }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Controllers

const userController = require("./controllers/userController");
app.use("/user", userController);

// Error handler

app.use((err, req, res, next) => {
  console.log(err);
  return res.json(`Error: ${err}`);
});

// Connect to port and DB

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
  // db.query(
  //   `CREATE TABLE IF NOT EXISTS accounts (username VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(100) NOT NULL, account_type VARCHAR(45) NOT NULL DEFAULT 'User', status VARCHAR(45) NOT NULL DEFAULT 'Active', PRIMARY KEY (username)) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8`
  // );
  // db.query(
  //   `INSERT INTO accounts (username, password, email, account_type) VALUES ("admin", "admin", "admin@admin.com", "Admin") WHERE NOT EXISTS (SELECT * FROM accounts WHERE username = "admin")`
  // );
});

app.listen(port, () => {
  console.log(`Connected to http://localhost:${port}`);
});
