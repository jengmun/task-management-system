const argon2 = require("argon2");
const { db, database } = require("../modules/db");
const emailNewPassword = require("../modules/email");

// ================= AUTHENTICATION ================= //

exports.login = (req, res, next) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      if (err) {
        next(err);
        return;
      }

      // Step 1 - check if user is valid
      if (!result || !result.length) {
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
          req.session.username = result[0].username;
          res.cookie("Username", result[0].username);

          // Step 4 - return data
          res.json({
            username: result[0].username,
            email: result[0].email,
            account_type: result[0].account_type,
          });
        } else {
          res.json("Invalid password");
        }
      });
    }
  );
};

exports.getLoginDetails = (req, res, next) => {
  db.query(
    "SELECT username, email, account_type FROM accounts WHERE username = ?",
    req.session.username,
    (err, results) => {
      if (err) {
        next(err);
      }
      res.json(results[0]);
    }
  );
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.clearCookie("Username");
  res.json("Logged out");
};

// ================= USER PRIVILEGES (EXCLUDING PW RESET) ================= //

exports.updateEmail = async (req, res, next) => {
  const { username, email } = req.body;

  db.query(
    "UPDATE accounts SET email = ? WHERE username = ?",
    [email, username],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
};

// ================= ADMIN PRIVILEGES ================= //

exports.getAllUsers = async (req, res, next) => {
  db.query(
    "SELECT accounts.username, email, account_type, status, GROUP_CONCAT(user_group) AS user_group, GROUP_CONCAT(group_name) AS group_name FROM accounts LEFT JOIN accounts_groups ON accounts.username = accounts_groups.username GROUP BY username;",
    (err, result) => {
      if (err) next(err);
      else {
        for (const user of result) {
          if (user.user_group) {
            user.user_group = user.user_group.split(",");
            user.group_name = user.group_name.split(",");
          } else {
            user.user_group = [""];
            user.group_name = [""];
          }
        }
        res.json(result);
      }
    }
  );
};

exports.getAllGroups = (req, res, next) => {
  db.query(`SELECT * FROM ${database}.groups`, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.json(result);
    }
  });
};

exports.getUserGroups = async (req, res, next) => {
  db.query(
    "SELECT accounts.username, email, account_type, status FROM accounts INNER JOIN accounts_groups ON accounts.username = accounts_groups.username WHERE accounts_groups.group_name = ?;",
    req.body.group,
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
};

exports.createAccount = async (req, res, next) => {
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

  const defaultErrorHandler = (err) => {
    if (err) {
      next(err);
    }
  };

  db.beginTransaction((err) => {
    if (err) {
      next(err);
    }

    db.query(
      "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email],
      (err) => {
        if (err) {
          db.rollback(defaultErrorHandler);
          next(err);
        } else {
          if (groups.length) {
            db.query("INSERT INTO accounts_groups VALUES " + values, (err) => {
              if (err) {
                db.rollback(defaultErrorHandler);
                next(err);
              } else {
                db.commit((err) => {
                  if (err) {
                    db.rollback(defaultErrorHandler);
                    next(err);
                  }
                });
                res.json("User created");
              }
            });
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(defaultErrorHandler);
                next(err);
              }
            });
            res.json("User created");
          }
        }
      }
    );
  });
};

exports.updateDetails = async (req, res) => {
  const { username, email, status } = req.body;
  db.query(
    "UPDATE accounts SET email = ?, status = ? WHERE username = ?",
    [email, status, username],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
};

// User management
exports.updateGroups = async (req, res, next) => {
  let { username, currentGroups, oldGroups } = req.body;
  let toDelete = [];

  if (!currentGroups.length) {
    toDelete = [...oldGroups];
  } else if (oldGroups.length && currentGroups.length) {
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
  }

  const insertQuery = async (group) => {
    return await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO accounts_groups VALUES (?, ?, ?)",
        [`${username}_${group.value}`, username, group.value],
        (err, result) => {
          if (err) {
            next(err);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  };

  const deleteQuery = async (group) => {
    return await new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM accounts_groups WHERE user_group = ?",
        [`${username}_${group}`],
        (err, result) => {
          if (err) {
            next(err);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  };

  async function runQueries() {
    for (const group of currentGroups) {
      const continueQuery = await insertQuery(group);
      if (!continueQuery) {
        return;
      }
    }

    for (const group of toDelete) {
      const continueQuery = await deleteQuery(group);
      if (!continueQuery) {
        return;
      }
    }

    res.json("Updated groups");
  }

  runQueries();
};

exports.createGroups = (req, res, next) => {
  db.query(
    `INSERT INTO ${database}.groups SET group_name = ?`,
    req.body.group,
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json("Group created!");
      }
    }
  );
};

exports.addGroupMember = (req, res, next) => {
  const { username, group } = req.body;

  db.query(
    "INSERT INTO accounts_groups VALUES (?, ?, ?)",
    [`${username}_${group}`, username, group],
    (err, result) => {
      if (err) throw err;
      res.json("Added");
    }
  );
};

exports.removeGroupMember = (req, res, next) => {
  const { username, group } = req.body;

  db.query(
    "DELETE FROM accounts_groups WHERE user_group = ?",
    [`${username}_${group}`],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json("Removed");
      }
    }
  );
};

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

exports.adminPasswordReset = async (req, res, next) => {
  try {
    const validUser = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM accounts WHERE username = ? AND email = ?",
        [req.body.username, req.body.email],
        (err, results) => {
          if (err) throw err;
          resolve(results);
        }
      );
    });

    if (!validUser.length) {
      res.json("No valid user found!");
      return;
    }

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

    db.query(
      "UPDATE accounts SET password = ? WHERE username = ? AND email = ? ",
      [hashedPassword, req.body.username, req.body.email],
      (err, result) => {
        if (err) throw err;
        res.json("Password successfully resetted");
      }
    );
  } catch (error) {
    next(error);
  }
};

// For users who forgot their password / had their passwords reset by the administrator
exports.userPasswordReset = async (req, res, next) => {
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
    next("Error resetting password");
  }
};

// For users who are logged in
exports.userUpdatePassword = async (req, res, next) => {
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
      if (err) next(err);
      else {
        res.json(result);
      }
    }
  );
};
