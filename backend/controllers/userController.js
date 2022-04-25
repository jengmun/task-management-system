const express = require("express");
const argon2 = require("argon2");
const { db, database } = require("../modules/db");
const emailNewPassword = require("../modules/email");
const { checkAdmin, checkLoggedIn } = require("../middleware/auth");

const router = express.Router();

// ------------- Routes -------------

// ================= AUTHENTICATION ================= //

router.post("/login", (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
});

router.get("/logout", checkLoggedIn, (req, res) => {
  req.session.isLoggedIn = false;
  req.session.isAdmin = false;
  res.json("Logged out");
});

// ================= USER PRIVILEGES (EXCLUDING PW RESET) ================= //

// router.get("/username/:username", checkLoggedIn, (req, res) => {
//   try {
//     db.query(
//       "SELECT * FROM accounts WHERE username = ?",
//       [req.params.username],
//       (err, result) => {
//         if (err) throw err;
//         res.json(result);
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// });

router.post("/update-email", checkLoggedIn, async (req, res) => {
  try {
    const { username, email } = req.body;

    db.query(
      "UPDATE accounts SET email = ? WHERE username = ?",
      [email, username],
      (err, result) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// ================= ADMIN PRIVILEGES ================= //

router.get("/all-users", checkAdmin, async (req, res) => {
  try {
    db.query(
      "SELECT accounts.username, email, account_type, status, GROUP_CONCAT(user_group) AS user_group, GROUP_CONCAT(group_name) AS group_name FROM accounts LEFT JOIN accounts_groups ON accounts.username = accounts_groups.username GROUP BY username;",
      (err, result) => {
        if (err) throw err;
        for (const user of result) {
          user.user_group = user.user_group.split(",");
          user.group_name = user.group_name.split(",");
        }
        res.json(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/all-groups", checkAdmin, (req, res) => {
  try {
    db.query(`SELECT * FROM ${database}.groups`, (err, result) => {
      res.json(result);
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/create-account", checkAdmin, async (req, res) => {
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
    res.json("User created!");
  } catch (error) {
    db.query("ROLLBACK");
    res.json("Error creating user");
  }
});

router.post("/update-details", checkAdmin, async (req, res) => {
  try {
    const { username, email, status } = req.body;
    db.query(
      "UPDATE accounts SET email = ?, status = ? WHERE username = ?",
      [email, status, username],
      (err, result) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/update-groups", checkAdmin, async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
});

router.post("/create-groups", checkAdmin, (req, res) => {
  try {
    db.query(
      `INSERT INTO ${database}.groups SET group_name = ?`,
      req.body.group,
      (err, result) => {
        if (err) throw err;
        res.json("Group created!");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// ================= PASSWORD RESETTING - USER AND ADMIN ================= //

const generatePassword = () => {
  const numbers = "0123456789";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const specials = "~!@-#$%^&*";
  const all = numbers + chars + specials;

  let password = "";
  const passwordLength = Math.floor(Math.random() * 3) + 5;

  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += chars[Math.floor(Math.random() * chars.length)];
  password += specials[Math.floor(Math.random() * specials.length)];
  for (let i = 1; i <= passwordLength; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password;
};

router.post("/admin-password-reset", async (req, res) => {
  const password = generatePassword();
  const link = `http://localhost:3000/reset-password/${req.body.username}`;
  emailNewPassword(
    req.body.email,
    "Your password has been resetted",
    `
      <h3>Your password has been resetted.</h3>
      <p>Your temporary password is: <b>${password}</b></p>
      <a href=${link}>Click to change your password</a>
      <p>Or copy and paste the URL in your browser:</p>
      <a href=${link}>${link}</a>
      `
  );

  const hashedPassword = await argon2.hash(password);

  db.query("UPDATE accounts SET password = ? WHERE username = ?", [
    hashedPassword,
    req.body.username,
  ]);
  res.json(password);
});

// For users who forgot their password / had their passwords reset by the administrator
router.post("/user-password-reset/:username", async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword;
    const username = req.params.username;

    if (
      !db.query(
        "SELECT password FROM accounts WHERE username = ?",
        username,
        (err, result) => {
          if (err) throw err;
          argon2.verify(result[0].password, oldPassword).then((argon2Match) => {
            if (!argon2Match) {
              return false;
            }
          });
        }
      )
    ) {
      res.json("Wrong password");
      return;
    }

    if (
      !req.body.password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      res.json("Invalid password format");
      return;
    }

    const password = await argon2.hash(req.body.password);

    db.query(
      "UPDATE accounts SET password = ? WHERE username = ?",
      [password, username],
      (err, result) => {
        if (err) throw err;
        res.json(result);
      }
    );
  } catch (error) {
    console.log(error);
    res.json("Error resetting password");
  }
});

// For users who are logged in
router.post("/user-update-password", checkLoggedIn, async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
