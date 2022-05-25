const checkGroup = require("../modules/checkGroup");
const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const argon2 = require("argon2");
const ErrorHandler = require("../utils/errorHandler");

// ================= ASSIGNMENT 3 ================= //

const a3Login = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.json("Please enter all details");
    return;
  }

  db.query(
    "SELECT * FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }

      // Step 1 - check if user is valid
      if (!result || !result.length) {
        res.json("Invalid user");
        return;
      }

      // Step 2 - check if user is active
      if (result[0].status !== "Active") {
        res.json("Inactive user");
        return;
      }

      argon2.verify(result[0].password, password).then((argon2Match) => {
        // Step 3 - check if valid password
        if (argon2Match) {
          // Step 4 - Evaluate
          next();
        } else {
          res.json("Invalid password");
        }
      });
    }
  );
};

const a3CheckApplicationAccess = async (req, res, next) => {
  let { app, task } = req.params;

  if (!app) {
    app = task.slice(0, 3);
  }

  const isMember = await new Promise((resolve) => {
    db.query(
      "SELECT * FROM accounts_groups WHERE username = ? AND acronym = ?",
      [req.body.username, app],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
        if (results.length) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });

  req.isMember = isMember;

  console.log(isMember);

  const isAdmin = await checkGroup(
    "accounts",
    req.body.username,
    "account_type",
    "Admin"
  );

  if (isMember || isAdmin) {
    next();
  } else {
    res.json(false);
  }
};

const a3CheckTaskPermissions = async (req, res, next) => {
  // const listOfActions = ["create", "open", "todo", "doing", "done"];
  const { taskID, acronym } = req.body;
  let action;

  if (!taskID) {
    action = "create";
  } else {
    const state = await checkState(taskID);
    if (state === "Closed") {
      res.json("Task is closed");
      return;
    } else {
      action = state.toLowerCase();
    }
  }

  const permittedGroup = await new Promise((resolve) => {
    db.query(
      "SELECT ?? FROM applications WHERE acronym = ?",
      [`permit_${action}`, acronym],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
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
    res.json("Insufficient permissions");
  }
};

module.exports = { a3Login, a3CheckApplicationAccess, a3CheckTaskPermissions };
