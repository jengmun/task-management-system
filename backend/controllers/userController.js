const argon2 = require("argon2");
const { db, database } = require("../modules/db");
const sendEmail = require("../modules/email");

// ================= AUTHENTICATION ================= //

exports.login = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.json("Please enter all details");
    return;
  }

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
        res.json("Email updated successfully");
      }
    }
  );
};

// ================= ADMIN PRIVILEGES ================= //

exports.getAllUsers = async (req, res, next) => {
  db.query(
    "SELECT accounts.username, email, account_type, status, GROUP_CONCAT(user_group) AS user_group FROM accounts LEFT JOIN accounts_groups ON accounts.username = accounts_groups.username GROUP BY username;",
    (err, result) => {
      if (err) return next(err);

      for (const user of result) {
        user.apps = [];
        user.groups = [];

        if (user.user_group) {
          const arrOfUserGroups = user.user_group.split(",");
          user.user_group = [];
          for (const group of arrOfUserGroups) {
            const firstSeparator = group.indexOf("_");
            const secondSeparator = group.indexOf("_", firstSeparator + 1);
            user.apps.push(group.slice(0, firstSeparator));
            user.groups.push(group.slice(firstSeparator + 1, secondSeparator));
            user.user_group.push(
              `${group.slice(0, firstSeparator)}_${group.slice(
                firstSeparator + 1,
                secondSeparator
              )}`
            );
          }
        } else {
          user.user_group = [];
        }
      }
      res.json(result);
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
    "SELECT accounts.username, email, account_type, status FROM accounts INNER JOIN accounts_groups ON accounts.username = accounts_groups.username WHERE accounts_groups.user_group LIKE ?;",
    req.body.group + "%",
    (err, result) => {
      if (err) {
        next(err);
      } else {
        console.log(result);
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
    const separatorIndex = groups[i].value.indexOf("_");
    const acronym = groups[i].value.slice(0, separatorIndex);
    const groupName = groups[i].value.slice(separatorIndex + 1);

    values += `("${acronym}_${groupName}_${username}", "${username}", "${groupName}", "${acronym}")`;

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
      return next(err);
    }

    db.query(
      "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email],
      (err) => {
        if (err) {
          db.rollback(defaultErrorHandler);
          return next(err);
        } else {
          if (groups.length) {
            db.query(
              "INSERT INTO accounts_groups (user_group, username, group_name, acronym) VALUES " +
                values,
              (err) => {
                if (err) {
                  db.rollback(defaultErrorHandler);
                  return next(err);
                } else {
                  db.commit((err) => {
                    if (err) {
                      db.rollback(defaultErrorHandler);
                      return next(err);
                    }
                  });
                  res.json("User created");
                }
              }
            );
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(defaultErrorHandler);
                return next(err);
              }
            });
            res.json("User created");
          }
        }
      }
    );
  });
};

exports.updateDetails = async (req, res, next) => {
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
      if (!currentGroups.length) {
        toDelete.push(oldGroups[i]);
      }
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
    const separatorIndex = group.value.indexOf("_");
    const acronym = group.value.slice(0, separatorIndex);
    const groupName = group.value.slice(separatorIndex + 1);

    console.log("insert ", acronym, groupName);

    return await new Promise((resolve) => {
      db.query(
        "INSERT INTO accounts_groups (user_group, username, group_name, acronym) VALUES (?, ?, ?, ?)",
        [`${acronym}_${groupName}_${username}`, username, groupName, acronym],
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
    return await new Promise((resolve) => {
      db.query(
        "DELETE FROM accounts_groups WHERE user_group = ?",
        [`${group}_${username}`],
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

  console.log("to Delete", toDelete);

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
    (err) => {
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

  const firstSeparator = group.indexOf("_");
  const app = group.slice(0, firstSeparator);

  const groupName = group.slice(firstSeparator + 1);

  db.query(
    "INSERT INTO accounts_groups (user_group, username, group_name, acronym) VALUES (?, ?, ?, ?)",
    [`${group}_${username}`, username, groupName, app],
    (err) => {
      if (err) return next(err);
      res.json("Added");
    }
  );
};

exports.removeGroupMember = (req, res, next) => {
  const { username, group } = req.body;

  db.query(
    "DELETE FROM accounts_groups WHERE user_group = ?",
    [`${group}_${username}`],
    (err) => {
      if (err) return next(err);
      res.json("Removed");
    }
  );
};

exports.assignPM = async (req, res, next) => {
  const { acronym, username } = req.body;

  const existingApp = await new Promise((resolve) => {
    db.query(
      "SELECT acronym FROM applications WHERE acronym = ?",
      acronym,
      (err, results) => {
        if (err) return next(err);
        resolve(results);
      }
    );
  });

  if (existingApp.length) {
    res.json("App already exists");
    return;
  }

  db.query(
    "INSERT INTO accounts_groups (user_group, username, group_name, acronym) VALUES (?, ?, 'Project Manager', ?)",
    [`${acronym}_Project Manager_${username}`, username, acronym],
    (err) => {
      if (err) return next(err);
      res.json("PM Assigned");
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
  const validUser = await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM accounts WHERE username = ? AND email = ?",
      [req.body.username, req.body.email],
      (err, results) => {
        if (err) return next(err);
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

  sendEmail(
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
      if (err) return next(err);
      res.json("Password successfully resetted");
    }
  );
};

// For users who forgot their password / had their passwords reset by the administrator
exports.userPasswordReset = async (req, res, next) => {
  const oldPassword = req.body.oldPassword;
  const username = req.params.username;

  const validPassword = await new Promise((resolve) => {
    db.query(
      "SELECT password FROM accounts WHERE username = ?",
      username,
      (err, result) => {
        if (err) return next(err);
        argon2.verify(result[0].password, oldPassword).then((argon2Match) => {
          if (!argon2Match) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      }
    );
  });

  if (!validPassword) {
    res.json("Current password is wrong!");
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
      if (err) return next(err);
      res.json("Password resetted!");
    }
  );
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
      if (err) return next(err);
      res.json(result);
    }
  );
};
