const express = require("express");
const session = require("express-session");
const cors = require("cors");
const db = require("./modules/db");

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

// Controllers

const userController = require("./controllers/userController.js");
const adminController = require("./controllers/adminController");
app.use("/users", userController);
app.use("/admin", adminController);

// Connect to port and DB

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

app.listen(port, () => {
  console.log(`Connected to http://localhost:${port}`);
});

// app.use(urlencoded()); // Setup the body parser to handle form submits
