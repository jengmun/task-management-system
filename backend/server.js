const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/config.env" });
const { db } = require("./modules/db");
const errorMiddleware = require("./middleware/errors");
const ErrorHandler = require("./utils/errorHandler");

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

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

// Routers
const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);
const taskRouter = require("./routers/taskRouter");
app.use("/task", taskRouter);

// Handling Unhandled Routes - Placed below all other routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Global error handler
app.use(errorMiddleware);

// Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});

// Handling Uncaught Exeception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

// Connect to port and DB

app.listen(process.env.PORT, () => {
  console.log(`Connected to http://localhost:${process.env.PORT}`);
});
