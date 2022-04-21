const express = require("express");
const argon2 = require("argon2");
const { db, database } = require("../modules/db");
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

router.get("/all-users", async (req, res) => {
  db.query(
    "SELECT accounts.username, email, account_type, status, GROUP_CONCAT(user_group) AS user_group, GROUP_CONCAT(group_name) AS group_name FROM accounts LEFT JOIN accounts_groups ON accounts.username = accounts_groups.username GROUP BY username;",
    (err, result) => {
      for (const user of result) {
        user.user_group = user.user_group.split(",");
        user.group_name = user.group_name.split(",");
      }
      res.json(result);
    }
  );
});

router.get("/all-groups", (req, res) => {
  db.query(`SELECT * FROM ${database}.groups`, (err, result) => {
    res.json(result);
  });
});

router.post("/create-account", async (req, res) => {
  const { username, password, email, groups } = req.body;

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

  let values = ``;
  for (let i = 0; i < groups.length; i++) {
    values += `("${username}_${groups[i].value}", "${username}", "${groups[i].value}")`;

    if (i !== groups.length - 1) {
      values += ", ";
    }
  }

  try {
    db.query("BEGIN");
    db.query(
      "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );
    db.query("INSERT INTO accounts_groups VALUES " + values);
    db.query("COMMIT");
  } catch (error) {
    db.query("ROLLBACK");
  }
});

router.post("/update-details", async (req, res) => {
  const { username, email } = req.body;
  let { group } = req.body;
  // const password = await argon2.hash(req.body.password);
  console.log(req.body);

  // db.query(
  //   "UPDATE accounts SET ?? = ? WHERE username = ?",
  //   [field, details, username],
  //   (err, result) => {
  //     if (err) throw err;
  //     res.json(result);
  //   }
  // );
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
