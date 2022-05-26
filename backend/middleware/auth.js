const checkGroup = require("../modules/checkGroup");
const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const checkAdmin = catchAsyncErrors(async (req, res, next) => {
  const isAdmin = await checkGroup(
    "accounts",
    req.session.username,
    "account_type",
    "Admin"
  );

  if (!isAdmin) {
    return next(new ErrorHandler("Unauthorised administrator!", 401));
  }

  next();
});

const checkLoggedIn = (req, res, next) => {
  if (!req.session.username) {
    return next(new ErrorHandler("User is not logged in!", 401));
  }
  next();
};

const checkPM = catchAsyncErrors(async (req, res, next) => {
  const { acronym } = req.body;

  const isPermitted = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    "Project Manager",
    acronym
  );

  if (isPermitted) {
    next();
  } else {
    return next(new ErrorHandler("Insufficient permissions", 401));
  }
});

const checkTaskPermissions = catchAsyncErrors(async (req, res, next) => {
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
    req.session.username,
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

module.exports = {
  checkAdmin,
  checkLoggedIn,
  checkPM,
  checkTaskPermissions,
};
