const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { db } = require("./modules/db");
require("dotenv").config({ path: "./config/config.env" });

const app = express();

app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routers

const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);
const taskRouter = require("./routers/taskRouter");
app.use("/task", taskRouter);

// Error handler

app.use((err, req, res, next) => {
  console.log(err);
  return res.json({ success: false, error: err });
});

// Connect to port and DB

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

app.listen(process.env.PORT, () => {
  console.log(`Connected to http://localhost:${process.env.PORT}`);
});
