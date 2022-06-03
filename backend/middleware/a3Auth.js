const checkGroup = require("../modules/checkGroup");
const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const argon2 = require("argon2");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// ================= ASSIGNMENT 3 ================= //

const a3Login = (req, res, next) => {
  const { username, password } = req.params;

  if (!username || !password) {
    return next(new ErrorHandler("Error 101", 400));
  }

  db.query(
    "SELECT * FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler());
      }

      // Step 1 - check if user is valid
      if (!result || !result.length) {
        return next(new ErrorHandler("Error 104", 401));
      }

      // Step 2 - check if user is active
      if (result[0].status !== "Active") {
        return next(new ErrorHandler("Error 105", 401));
      }

      argon2.verify(result[0].password, password).then((argon2Match) => {
        // Step 3 - check if valid password
        if (argon2Match) {
          // Step 4 - Evaluate
          next();
        } else {
          return next(new ErrorHandler("Error 103", 400));
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
    action = state.toLowerCase();
  }

  if (!action) {
    return next(new ErrorHandler("Error 301", 400));
  }

  if (!acronym) {
    return next(new ErrorHandler("Error 305", 400));
  }

  if (acronym.length !== 3) {
    return next(new ErrorHandler("Error 303", 400));
  }

  const permittedGroup = await new Promise((resolve, reject) => {
    db.query(
      "SELECT ?? FROM applications WHERE acronym = ?",
      [`permit_${action}`, acronym],
      (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length) {
          resolve(results[0][`permit_${action}`]);
        } else {
          reject(new ErrorHandler("Error 303", 400));
        }
      }
    );
  });

  console.log("Permitted Group: ", permittedGroup);
  const isPermitted = await checkGroup(
    "accounts_groups",
    req.params.username,
    "group_name",
    permittedGroup,
    acronym
  );
  console.log("isPermitted: ", isPermitted);

  if (isPermitted) {
    next();
  } else {
    return next(new ErrorHandler("Error 200", 401));
  }
});

module.exports = { a3Login, a3CheckTaskPermissions };
