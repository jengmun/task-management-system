const express = require("express");
const argon2 = require("argon2");
const db = require("../modules/db");
const router = express.Router();

// Middleware to handle login
// router.use("/", (req, res, next) => {
//   if (req.path !== "/login" && !req.session.isLoggedIn) {
//     res.json("User is not logged in!");
//     return;
//   }
//   next();
// });

// ------------- Routes -------------

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT password, user_group FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      argon2.verify(result[0].password, password).then((argon2Match) => {
        if (argon2Match) {
          req.session.isLoggedIn = true;
          if (result[0].user_group === "Admin") {
            req.session.isAdmin = true;
            res.json({ username, admin: true });
          } else {
            req.session.isAdmin = false;
            res.json({ username, admin: false });
          }
        }
      });
    }
  );
});

router.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  req.session.isAdmin = false;
  res.json("Logged out");
});

router.get("/:username", (req, res) => {
  db.query(
    "SELECT * FROM accounts WHERE username = ?",
    [req.params.username],
    (err, result) => {
      res.json(result);
    }
  );
});

router.post("/update-details", async (req, res) => {
  const { username, email } = req.body;
  const password = await argon2.hash(req.body.password);

  // db.query(
  //   "UPDATE accounts SET ?? = ? WHERE username = ?",
  //   [field, details, username],
  //   (err, result) => {
  //     if (err) throw err;
  //     res.json(result);
  //   }
  // );
});

module.exports = router;
