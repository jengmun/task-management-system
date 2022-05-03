const checkGroup = require("../modules/checkGroup");
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

const checkPermissions = async (req, res, next) => {
  const isDeveloper = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    "Developer"
  );
  const isTeamLead = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    "Team Lead"
  );
  const isPM = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    "Project Manager"
  );

  db.query(
    "SELECT * FROM applications WHERE acronym = ?",
    req.body.acronym,
    (err) => {
      if (err) {
        next(err);
      }
    }
  );
};

module.exports = { checkAdmin, checkLoggedIn };
