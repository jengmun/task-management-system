const express = require("express");
const argon2 = require("argon2");
const { db } = require("../modules/db");
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
    "SELECT * FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      // Step 1 - check if user is valid
      if (!result) {
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
          req.session.isLoggedIn = true;
        } else {
          res.json("Invalid password");
          return;
        }

        // Step 4 - check if admin
        if (result[0].account_type === "Admin") {
          req.session.isAdmin = true;
        } else {
          req.session.isAdmin = false;
        }

        // Step 5 - return data
        res.json({
          username: result[0].username,
          email: result[0].email,
          account_type: result[0].account_type,
        });
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

router.post("/update-email", async (req, res) => {
  const { username, email } = req.body;

  db.query(
    "UPDATE accounts SET email = ? WHERE username = ?",
    [email, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/update-password", async (req, res) => {
  if (
    !req.body.password.match(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
    )
  ) {
    res.json("Invalid password format");
    return;
  }

  const { username } = req.body;
  const password = await argon2.hash(req.body.password);

  db.query(
    "UPDATE accounts SET password = ? WHERE username = ?",
    [password, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

module.exports = router;
