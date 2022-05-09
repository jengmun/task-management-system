const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const sendEmail = require("../modules/email");

exports.createApplication = (req, res, next) => {
  db.query(
    "INSERT INTO applications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.acronym.toUpperCase(),
      req.body.description,
      1,
      req.body.startDate,
      req.body.endDate,
      req.body.permitCreate,
      req.body.permitOpen,
      req.body.permitTodo,
      req.body.permitDoing,
      req.body.permitDone,
    ],
    (err, results) => {
      if (err) {
        next(err);
      } else {
        console.log(results);
        res.json(results);
      }
    }
  );
};

exports.allApplications = (req, res, next) => {
  db.query(`SELECT acronym FROM applications`, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.json(result);
    }
  });
};

exports.userApplications = (req, res, next) => {
  db.query(
    `SELECT DISTINCT acronym FROM accounts_groups WHERE username = ?`,
    req.session.username,
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
};

exports.applicationDetails = (req, res, next) => {
  db.query(
    `SELECT * FROM applications WHERE acronym = ?`,
    req.params.app,
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result[0]);
      }
    }
  );
};

exports.updateApp = (req, res, next) => {
  const { app } = req.params;

  db.query(
    `UPDATE applications SET description = ?, start_date = ?, end_date = ?, permit_create = ?, permit_open = ?, permit_todo = ?, permit_doing = ?, permit_done = ? WHERE acronym = ?`,
    [
      req.body.description,
      req.body.startDate,
      req.body.endDate,
      req.body.permitCreate,
      req.body.permitOpen,
      req.body.permitTodo,
      req.body.permitDoing,
      req.body.permitDone,
      app,
    ],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json("Updated app");
      }
    }
  );
};

exports.createPlan = (req, res, next) => {
  db.query(
    "INSERT INTO plans VALUES (?, ?, ?, ?)",
    [req.body.planName, req.body.startDate, req.body.endDate, req.body.acronym],
    (err, results) => {
      if (err) {
        next(err);
      } else {
        res.json("Plan created");
      }
    }
  );
};

exports.updatePlan = (req, res, next) => {
  db.query(
    "UPDATE plans SET plan_name = ?, start_date = ?, end_date = ? WHERE plan_name = ?",
    [
      req.body.planName,
      req.body.startDate,
      req.body.endDate,
      req.body.currentPlan,
    ],
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json("Plan updated");
      }
    }
  );
};

exports.allPlans = (req, res, next) => {
  db.query(
    `SELECT * FROM plans WHERE acronym = ?`,
    req.params.app,
    (err, result) => {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
};

exports.createTask = async (req, res, next) => {
  const runningNumber = await new Promise((resolve, reject) => {
    db.query(
      "SELECT running_number FROM applications WHERE acronym = ?",
      [req.body.acronym],
      (err, results) => {
        if (err) {
          next(err);
        } else {
          resolve(results[0].running_number);
        }
      }
    );
  });

  db.query(
    "INSERT INTO tasks (task_id, task_name, description, plan_name, acronym, state, creator) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      `${req.body.acronym.toUpperCase()}_${runningNumber}`,
      req.body.taskName,
      req.body.description,
      req.body.planName ? req.body.planName : null,
      req.body.acronym.toUpperCase(),
      "Open",
      req.session.username,
    ],
    (err) => {
      if (err) {
        next(err);
      } else {
        db.query(
          "UPDATE applications SET running_number = ?",
          runningNumber + 1,
          (err, results) => {
            if (err) {
              next(err);
            } else {
              res.json("Task created");
            }
          }
        );
      }
    }
  );
};

exports.allAppTasks = (req, res, next) => {
  const acronym = req.params.app;

  db.query("SELECT * FROM tasks WHERE acronym = ?", acronym, (err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
};

exports.taskDetails = (req, res, next) => {
  const taskID = req.params.task;

  db.query("SELECT * FROM tasks WHERE task_id = ?", taskID, (err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results[0]);
  });
};

exports.updateTask = (req, res, next) => {
  const taskID = req.params.task;
  const { description, planName } = req.body;

  const validPlan = new Promise((resolve) => {
    db.query(
      `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ?`,
      [taskID.slice(0, 3), planName],
      (err, result) => {
        if (err) {
          next(err);
        } else {
          if (result.length) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });

  if (validPlan) {
    db.query(
      "UPDATE tasks SET description = ?, plan_name = ? WHERE task_id = ?",
      [description, planName, taskID],
      (err, results) => {
        if (err) {
          return next(err);
        }
        res.json("Task updated");
      }
    );
  } else {
    res.json("Invalid plan selected");
  }
};

exports.updatePermissions = (req, res, next) => {
  const { create, open, todo, doing, done, acronym } = req.body;

  db.query(
    "UPDATE applications SET permit_create = ?, permit_open = ?, permit_todo = ?, permit_doing = ?, permit_done = ? WHERE acronym = ?",
    [create, open, todo, doing, done, acronym],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json("Permissions updated");
    }
  );
};

const listOfStates = ["Open", "Todo", "Doing", "Done", "Closed"];

exports.taskStateProgression = async (req, res, next) => {
  const { taskID, acronym } = req.body;

  const results = await new Promise((resolve) => {
    db.query(
      "SELECT state, owner FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.length) {
          resolve(results[0]);
        } else {
          resolve({ state: "", owner: "" });
        }
      }
    );
  });

  const currentState = results.state;
  const owner = results.owner;
  console.log("currentState: ", currentState);

  if (currentState === "Closed" || !currentState) {
    res.json("State can't be updated!");
    return;
  }

  if (owner === req.session.username && currentState === "Done") {
    res.json("Checker cannot be the owner of the task!");
    return;
  }

  const newState = listOfStates[listOfStates.indexOf(currentState) + 1];
  console.log("New state:", newState);

  // Update task state
  db.query(
    "UPDATE tasks SET state = ? WHERE task_id = ?",
    [newState, taskID],
    (err, results) => {
      if (err) {
        return next(err);
      }
    }
  );

  // Update owner of task
  if (newState === "Doing") {
    db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
      req.session.username,
      taskID,
    ]),
      (err, results) => {
        if (err) {
          return next(err);
        }
      };
  }

  const teamLeads = await new Promise((resolve) => {
    db.query(
      "SELECT accounts_groups.username, email FROM accounts_groups INNER JOIN accounts on accounts_groups.username = accounts.username WHERE acronym = ? AND group_name = 'Team Lead'",
      acronym,
      (err, results) => {
        if (err) {
          return next(err);
        }
        resolve(results);
      }
    );
  });

  // for (const teamLead of teamLeads) {
  //   sendEmail(
  //     teamLead.email,
  //     `${acronym}: Task promoted to Done`,
  //     `Task ${taskID} of Application ${acronym} has been promoted to Done by ${req.session.username}.`
  //   );
  // }

  res.json("State updated");
};

exports.taskStateRegression = async (req, res, next) => {
  const { taskID } = req.body;

  const currentState = await checkState(taskID);

  if (currentState !== "Doing" && currentState !== "Done") {
    res.json("State can't be demoted!");
    return;
  }

  const newState = listOfStates[listOfStates.indexOf(currentState) - 1];

  db.query(
    "UPDATE tasks SET state = ? WHERE task_id = ?",
    [newState, taskID],
    (err, results) => {
      if (err) {
        return next(err);
      }
    }
  );

  if (newState === "Todo") {
    db.query("UPDATE tasks SET owner = NULL WHERE task_id = ?", [taskID]),
      (err, results) => {
        if (err) {
          return next(err);
        }
      };
  }

  res.json("State demoted");
};

exports.createNotes = async (req, res, next) => {
  const { details, taskID } = req.body;

  const state = await checkState(taskID);

  const runningNumber = await new Promise((resolve) => {
    db.query(
      "SELECT running_number FROM notes WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.length) {
          resolve(results[results.length - 1].running_number + 1);
        } else {
          resolve(1);
        }
      }
    );
  });

  db.query(
    "INSERT INTO notes (notes_id, running_number, details, creator, state, task_id) VALUES (?, ?, ?, ?, ?, ?)",
    [
      `${taskID}_${runningNumber}`,
      runningNumber,
      details,
      req.session.username,
      state,
      taskID,
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json("Added note");
    }
  );
};

exports.allNotes = (req, res, next) => {
  const taskID = req.params.task;
  db.query("SELECT * FROM notes WHERE task_id = ?", taskID, (err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
};
