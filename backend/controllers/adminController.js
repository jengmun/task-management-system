const express = require("express");
const argon2 = require("argon2");
const db = require("../modules/db");
const router = express.Router();

// Middleware to handle admin auth
router.use("/", (req, res, next) => {
  if (!req.session.isAdmin) {
    res.json("Unauthorised administrator!");
    return;
  }
  next();
});

// ------------- Routes -------------

router.get("/all-users", (req, res) => {
  db.query("SELECT username FROM accounts", (err, result) => {
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
    "INSERT INTO accounts (username, password, email, user_group) VALUES (?, ?, ?, ?)",
    [username, hashedPassword, email, group],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/update-details", async (req, res) => {
  const { field, username } = req.body;
  let { details } = req.body;

  if (field === "password") {
    details = await argon2.hash(details);
  }
  db.query(
    "UPDATE accounts SET ?? = ? WHERE username = ?",
    [field, details, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/disable-user", (req, res) => {
  db.query(
    'UPDATE accounts SET status = "Disabled" WHERE username = ?',
    req.body.username,
    (err, result) => {
      if (err) throw err;
      res.json("User disabled");
    }
  );
});

module.exports = router;
