const checkGroup = require("../modules/checkGroup");
const checkState = require("../modules/checkState");
const { db } = require("../modules/db");

const checkAdmin = async (req, res, next) => {
  const isAdmin = await checkGroup(
    "accounts",
    req.session.username,
    "account_type",
    "Admin"
  );

  if (!isAdmin) {
    res.json("Unauthorised administrator!");
    return;
  }

  next();
};

const checkLoggedIn = (req, res, next) => {
  if (!req.session.username) {
    res.json("User is not logged in!");
    return;
  }
  next();
};

const checkPM = async (req, res, next) => {
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
    res.json("Insufficient permissions");
  }
};

const checkTaskPermissions = async (req, res, next) => {
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
          return next(err);
        }
        resolve(results[0][`permit_${action}`]);
      }
    );
  });

  const isPermitted = await checkGroup(
    "accounts_groups",
    req.body.username,
    // to change back
    "group_name",
    permittedGroup,
    acronym
  );

  if (isPermitted) {
    next();
  } else {
    res.json("Insufficient permissions");
  }
};

module.exports = { checkAdmin, checkLoggedIn, checkPM, checkTaskPermissions };
