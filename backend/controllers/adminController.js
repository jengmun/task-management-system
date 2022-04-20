const express = require("express");
const argon2 = require("argon2");
const db = require("../modules/db");
const router = express.Router();

// ------------- Middleware -------------
// router.use("/", (req, res, next) => {
//   if (!req.session.isAdmin) {
//     res.json("Unauthorised administrator!");
//     return;
//   }
//   next();
// });

// ------------- Routes -------------

router.get("/all-users", (req, res) => {
  db.query("SELECT * FROM accounts", (err, result) => {
    res.json(result);
  });
});

router.post("/create-account", async (req, res) => {
  const { username, password, email, group } = req.body;

  // Password validation
  if (
    !password.match(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
    )
  ) {
    res.json("Invalid password format");
    return;
  }

  const hashedPassword = await argon2.hash(password);

  db.query(
    "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
    [username, hashedPassword, email],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );

  db.query(
    "INSERT INTO accounts_groups (user_group, username, group_name) VALUES (?, ?, ?)",
    [`${username}_${group}`, username, group],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/update-details", async (req, res) => {
  const { username, email, group } = req.body;
  const password = await argon2.hash(req.body.password);

  db.query(
    "UPDATE accounts SET ?? = ? WHERE username = ?",
    [field, details, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/toggle-status", (req, res) => {
  db.query(
    "UPDATE accounts SET status = ? WHERE username = ?",
    [req.body.status, req.body.username],
    (err, result) => {
      if (err) throw err;
      res.json(`Status changed to ${req.body.status}`);
    }
  );
});

module.exports = router;
