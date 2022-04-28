const checkGroup = require("../modules/checkGroup");

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

module.exports = { checkAdmin, checkLoggedIn };
