const checkAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    res.json("Unauthorised administrator!");
    return;
  }
  next();
};

const checkLoggedIn = (req, res, next) => {
  if (req.path !== "/login" && !req.session.isLoggedIn) {
    res.json("User is not logged in!");
    return;
  }
  next();
};

module.exports = { checkAdmin, checkLoggedIn };
