const checkGroup = require("../modules/checkGroup");
const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const argon2 = require("argon2");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// ================= ASSIGNMENT 3 ================= //

const a3Login = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ErrorHandler("Please enter all details", 400));
  }

  db.query(
    "SELECT * FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler("Error logging in", 500));
      }

      // Step 1 - check if user is valid
      if (!result || !result.length) {
        return next(new ErrorHandler("Invalid user", 401));
      }

      // Step 2 - check if user is active
      if (result[0].status !== "Active") {
        return next(new ErrorHandler("Inactive user", 401));
      }

      argon2.verify(result[0].password, password).then((argon2Match) => {
        // Step 3 - check if valid password
        if (argon2Match) {
          // Step 4 - Evaluate
          next();
        } else {
          return next(new ErrorHandler("Invalid password", 400));
        }
      });
    }
  );
};

const a3CheckTaskPermissions = catchAsyncErrors(async (req, res, next) => {
  // const listOfActions = ["create", "open", "todo", "doing", "done"];
  const { taskID, acronym } = req.body;
  let action;

  if (!taskID) {
    action = "create";
  } else {
    const state = await checkState(taskID);
    if (state === "Closed") {
      return next(new ErrorHandler("Task is closed", 500));
    } else {
      action = state.toLowerCase();
    }
  }

  const permittedGroup = await new Promise((resolve, reject) => {
    db.query(
      "SELECT ?? FROM applications WHERE acronym = ?",
      [`permit_${action}`, acronym],
      (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results[0][`permit_${action}`]);
      }
    );
  });

  console.log("Permitted Group: ", permittedGroup);
  const isPermitted = await checkGroup(
    "accounts_groups",
    req.body.username,
    "group_name",
    permittedGroup,
    acronym
  );
  console.log("isPermitted: ", isPermitted);

  if (isPermitted) {
    next();
  } else {
    return next(new ErrorHandler("Insufficient permissions", 401));
  }
});

module.exports = { a3Login, a3CheckTaskPermissions };
