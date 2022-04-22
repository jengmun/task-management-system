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
  const { username, email, status } = req.body;
  db.query(
    "UPDATE accounts SET email = ?, status = ? WHERE username = ?",
    [email, status, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

router.post("/update-groups", async (req, res) => {
  let { username, currentGroups, oldGroups } = req.body;
  const toDelete = [];

  for (let i = 0; i < oldGroups.length; i++) {
    for (let j = 0; j < currentGroups.length; j++) {
      if (oldGroups[i] === currentGroups[j].value) {
        currentGroups.splice(j, 1);
        break;
      } else if (j === currentGroups.length - 1) {
        toDelete.push(oldGroups[i]);
      }
    }
  }

  for (const group of currentGroups) {
    db.query(
      "INSERT INTO accounts_groups VALUES (?, ?, ?)",
      [`${username}_${group.value}`, username, group.value],
      (err, result) => {
        if (err) throw err;
      }
    );
  }

  for (const group of toDelete) {
    db.query(
      "DELETE FROM accounts_groups WHERE user_group = ?",
      [`${username}_${group}`],
      (err, result) => {
        if (err) throw err;
      }
    );
  }

  res.json("Updated groups");
});

module.exports = router;
