const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const sendEmail = require("../modules/email");
const checkGroup = require("../modules/checkGroup");
const moment = require("moment");
const ErrorHandler = require("../utils/errorHandler");

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
        return next(new ErrorHandler(err, 500));
      } else {
        res.json("Application successfully created");
      }
    }
  );
};

exports.allApplications = (req, res, next) => {
  db.query(`SELECT acronym FROM applications`, (err, result) => {
    if (err) {
      return next(new ErrorHandler(err, 500));
    } else {
      res.json(result);
    }
  });
};

exports.userApplications = (req, res, next) => {
  db.query(
    `SELECT DISTINCT accounts_groups.acronym FROM accounts_groups INNER JOIN applications ON applications.acronym = accounts_groups.acronym WHERE accounts_groups.username = ?`,
    req.session.username,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        res.json(result);
      }
    }
  );
};

exports.uncreatedApplications = async (req, res, next) => {
  const assignedApps = await new Promise((resolve) => {
    db.query(
      "SELECT DISTINCT acronym FROM accounts_groups WHERE username = ?",
      req.session.username,
      (err, result) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else {
          resolve(result);
        }
      }
    );
  });

  const uncreatedApps = [];

  for (let i = 0; i < assignedApps.length; i++) {
    db.query(
      "SELECT acronym FROM applications WHERE acronym = ?",
      assignedApps[i].acronym,
      (err, result) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else if (!result.length) {
          uncreatedApps.push(assignedApps[i].acronym);
        }

        if (i === assignedApps.length - 1) {
          res.json(uncreatedApps);
        }
      }
    );
  }
};

exports.applicationDetails = (req, res, next) => {
  db.query(
    `SELECT * FROM applications WHERE acronym = ?`,
    req.params.app,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
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
        return next(new ErrorHandler(err, 500));
      } else {
        res.json("Updated app");
      }
    }
  );
};

exports.createPlan = (req, res, next) => {
  db.query(
    "INSERT INTO plans (plan_name, description, start_date, end_date, acronym) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.planName,
      req.body.description,
      req.body.startDate,
      req.body.endDate,
      req.body.acronym,
    ],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        res.json("Plan created");
      }
    }
  );
};

exports.updatePlan = (req, res, next) => {
  db.query(
    "UPDATE plans SET description = ?, start_date = ?, end_date = ? WHERE plan_name = ? AND status = 'Open'",
    [
      req.body.description,
      req.body.startDate,
      req.body.endDate,
      req.body.currentPlan,
    ],
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        if (result.affectedRows) {
          res.json("Plan updated");
        } else {
          res.json("No open plan found!");
        }
      }
    }
  );
};

exports.updatePlanStatus = async (req, res, next) => {
  const allTasksClosed = await new Promise((resolve) => {
    db.query(
      "SELECT task_id FROM tasks WHERE plan_name = ? AND acronym = ? AND state != 'Closed'",
      [req.body.planName, req.params.app],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else if (results.length) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });

  console.log("allTaskClosed", allTasksClosed);

  if (allTasksClosed) {
    db.query(
      "UPDATE plans SET status = 'Closed' WHERE plan_name = ?",
      [req.body.planName],
      (err, result) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else {
          res.json("Plan status updated");
        }
      }
    );
  } else {
    res.json("There are pending open tasks");
  }
};

exports.allPlans = (req, res, next) => {
  db.query(
    `SELECT * FROM plans WHERE acronym = ?`,
    req.params.app,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        res.json(result);
      }
    }
  );
};

exports.allOpenPlans = (req, res, next) => {
  db.query(
    `SELECT * FROM plans WHERE acronym = ? AND status = 'Open'`,
    req.params.app,
    (err, result) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        res.json(result);
      }
    }
  );
};

exports.createTask = async (req, res, next) => {
  if (req.body.planName) {
    const validPlan = await new Promise((resolve) => {
      db.query(
        `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ? AND status = 'Open'`,
        [req.body.acronym, req.body.planName],
        (err, result) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
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

    if (!validPlan) {
      res.json("No valid open plan found!");
      return;
    }
  }

  const runningNumber = await new Promise((resolve, reject) => {
    db.query(
      "SELECT running_number FROM applications WHERE acronym = ?",
      [req.body.acronym],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
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
        return next(new ErrorHandler(err, 500));
      } else {
        db.query(
          "UPDATE applications SET running_number = ?",
          runningNumber + 1,
          (err, results) => {
            if (err) {
              return next(new ErrorHandler(err, 500));
            } else {
              req.body.taskID = `${req.body.acronym.toUpperCase()}_${runningNumber}`;
              req.body.details = "Task created";
              next();
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
      return next(new ErrorHandler(err, 500));
    }
    res.json(results);
  });
};

exports.taskDetails = (req, res, next) => {
  const taskID = req.params.task;

  db.query("SELECT * FROM tasks WHERE task_id = ?", taskID, (err, results) => {
    if (err) {
      return next(new ErrorHandler(err, 500));
    }
    res.json(results[0]);
  });
};

exports.updateTask = async (req, res, next) => {
  const { taskID, acronym } = req.body;

  const permittedGroup = await new Promise((resolve) => {
    db.query(
      "SELECT permit_create FROM applications WHERE acronym = ?",
      [acronym],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
        resolve(results[0]["permit_create"]);
      }
    );
  });

  console.log(permittedGroup);

  const isPermitted = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    permittedGroup,
    acronym
  );

  if (!isPermitted) {
    res.json("Insufficient permissions");
    return;
  }
  console.log(isPermitted);

  const results = await new Promise((resolve) => {
    db.query(
      "SELECT state FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
        console.log(results[0].state);
        if (results.length) {
          resolve(results[0]);
        } else {
          resolve({ state: "" });
        }
      }
    );
  });

  const currentState = results.state;
  console.log(currentState);

  if (currentState !== "Open" || !currentState) {
    res.json("Task can't be updated!");
    return;
  }

  let { description, planName } = req.body;

  const oldDetails = await new Promise((resolve) => {
    db.query(
      `SELECT description, plan_name FROM tasks WHERE task_id = ?`,
      [taskID],
      (err, result) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else {
          resolve(result[0]);
        }
      }
    );
  });

  if (
    oldDetails.description === description &&
    (oldDetails.plan_name === planName ||
      (!oldDetails.plan_name && planName === "null"))
  ) {
    res.json("No change in details");
    return;
  }

  if (planName !== "null") {
    const validPlan = await new Promise((resolve) => {
      db.query(
        `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ? AND status = 'Open'`,
        [taskID.slice(0, 3), planName],
        (err, result) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
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

    if (!validPlan) {
      res.json("Invalid plan selected or plan is closed!");
      return;
    }
  } else {
    planName = null;
  }

  db.query(
    "UPDATE tasks SET description = ?, plan_name = ? WHERE task_id = ?",
    [description, planName, taskID],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }

      if (
        oldDetails.description !== description &&
        oldDetails.plan_name !== planName
      ) {
        req.body.details = `Task description updated from ${oldDetails.description} to ${description}. Plan name updated from from ${oldDetails.plan_name} to ${planName}.`;
      } else if (oldDetails.description !== description) {
        req.body.details = `Task description updated from ${oldDetails.description} to ${description}.`;
      } else {
        req.body.details = `Plan name updated from from ${oldDetails.plan_name} to ${planName}.`;
      }

      next();
    }
  );
};

exports.hasPermissions = async (req, res, next) => {
  const { app, permission } = req.body;

  const appDetails = await new Promise((resolve) => {
    db.query(
      "SELECT * FROM applications WHERE acronym = ?",
      [app],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
        resolve(results[0]);
      }
    );
  });

  if (!appDetails) {
    res.json("App does not exist");
    return;
  }

  db.query(
    "SELECT group_name FROM accounts_groups WHERE acronym = ? AND group_name = ? AND username = ?",
    [app, appDetails[permission], req.session.username],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      if (results.length) {
        res.json(true);
      } else {
        res.json(false);
      }
    }
  );
};

exports.getPermissions = (req, res, next) => {
  db.query(
    "SELECT group_name FROM accounts_groups WHERE acronym = ? AND username = ?",
    [req.params.app, req.session.username],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      res.json(results);
    }
  );
};

exports.updatePermissions = (req, res, next) => {
  const { create, open, todo, doing, done, acronym } = req.body;

  db.query(
    "UPDATE applications SET permit_create = ?, permit_open = ?, permit_todo = ?, permit_doing = ?, permit_done = ? WHERE acronym = ?",
    [create, open, todo, doing, done, acronym],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
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
      "SELECT state, creator, owner FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
        if (results.length) {
          resolve(results[0]);
        } else {
          resolve({ state: "", creator: "", owner: "" });
        }
      }
    );
  });

  const currentState = results.state;
  const { creator, owner } = results;
  console.log("currentState: ", currentState);

  if (currentState === "Closed" || !currentState) {
    res.json("State can't be updated!");
    return;
  }

  if (creator === req.session.username && currentState === "Open") {
    res.json("Approver cannot be the creator of the task!");
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
        return next(new ErrorHandler(err, 500));
      }
    }
  );

  if (newState === "Done") {
    // Update owner
    if (req.session.username !== owner) {
      db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
        req.session.username,
        taskID,
      ]),
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
        };
    }

    // Send email to approvers
    const approverGroup = await new Promise((resolve) => {
      db.query(
        "SELECT permit_done FROM applications WHERE acronym = ?",
        [acronym],
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
          resolve(results[0].permit_done);
        }
      );
    });

    const allApprovers = await new Promise((resolve) => {
      db.query(
        "SELECT accounts_groups.username, email FROM accounts_groups INNER JOIN accounts on accounts_groups.username = accounts.username WHERE acronym = ? AND group_name = ?",
        [acronym, approverGroup],
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
          console.log(results);
          resolve(results);
        }
      );
    });

    for (const approver of allApprovers) {
      sendEmail(
        approver.email,
        `${acronym}: Task promoted to Done`,
        `Task ${taskID} of Application ${acronym} has been promoted to Done by ${req.session.username}.`
      );
    }
  }

  req.body.details = `Task updated from ${currentState} to ${newState}`;

  if (newState === "Closed") {
    req.state = "Done";
  }

  next();
};

exports.taskStateRegression = async (req, res, next) => {
  const { taskID } = req.body;

  const currentState = await checkState(taskID);

  // Only can demote from Done to Doing and Doing to Todo
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
        return next(new ErrorHandler(err, 500));
      }
    }
  );

  if (newState === "Todo") {
    db.query("UPDATE tasks SET owner = NULL WHERE task_id = ?", [taskID]),
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
      };
  }

  req.body.details = `Task updated from ${currentState} to ${newState}`;

  next();
};

exports.createNotes = async (req, res, next) => {
  if (req.isMember === false) {
    res.json("Not a member");
    return;
  }

  let { details, taskID } = req.body;
  let state = req.state;

  if (!req.state) {
    state = await checkState(taskID);
  }

  if (state === "Closed") {
    res.json("Task is closed!");
    return;
  }

  if (!details) {
    res.json("Please enter some notes");
    return;
  }

  if (!taskID) {
    taskID = req.params.task;
  }

  if (state === "Doing") {
    db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
      req.session.username,
      taskID,
    ]),
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
      };
  }

  const existingNotes = await new Promise((resolve) => {
    db.query(
      "SELECT notes FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        } else {
          resolve(results[0].notes);
        }
      }
    );
  });

  const parsedNotes = JSON.parse(existingNotes);
  let newNotes = [];
  const date = moment(new Date()).format("YYYY-MM-DD");
  const time = new Date().toLocaleTimeString();
  const timestamp = date + " " + time;

  if (existingNotes) {
    newNotes = [
      { details, timestamp, creator: req.session.username, state },
      ...parsedNotes,
    ];
  } else {
    newNotes = [{ details, timestamp, creator: req.session.username, state }];
  }

  db.query(
    "UPDATE tasks SET notes = ? WHERE task_id = ?",
    [JSON.stringify(newNotes), taskID],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      res.json("Added note");
    }
  );
};

exports.allNotes = (req, res, next) => {
  const taskID = req.params.task;
  db.query(
    "SELECT notes FROM tasks WHERE task_id = ?",
    taskID,
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      res.json(JSON.parse(results[0].notes));
    }
  );
};

exports.isGroup = async (req, res, next) => {
  const { acronym } = req.body;

  const isPermitted = await checkGroup(
    "accounts_groups",
    req.session.username,
    "group_name",
    req.body.group,
    acronym ? acronym : null
  );

  if (isPermitted) {
    res.json(true);
  } else {
    res.json(false);
  }
};

exports.isMember = async (req, res, next) => {
  res.json(req.isMember);
};

// ================= ASSIGNMENT 3 ================= //

exports.a3AllAppTasksByState = (req, res, next) => {
  const { app, state } = req.params;

  db.query(
    "SELECT * FROM tasks WHERE acronym = ? AND state = ?",
    [app, state],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      res.json(results);
    }
  );
};

exports.a3CreateTask = async (req, res, next) => {
  if (req.body.planName) {
    const validPlan = await new Promise((resolve) => {
      db.query(
        `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ? AND status = 'Open'`,
        [req.body.acronym, req.body.planName],
        (err, result) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
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

    if (!validPlan) {
      res.json("No valid open plan found!");
      return;
    }
  }

  const runningNumber = await new Promise((resolve, reject) => {
    db.query(
      "SELECT running_number FROM applications WHERE acronym = ?",
      [req.body.acronym],
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
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
      req.body.username,
    ],
    (err) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      } else {
        db.query(
          "UPDATE applications SET running_number = ?",
          runningNumber + 1,
          (err, results) => {
            if (err) {
              return next(new ErrorHandler(err, 500));
            } else {
              req.body.taskID = `${req.body.acronym.toUpperCase()}_${runningNumber}`;
              req.body.details = "Task created";
              next();
            }
          }
        );
      }
    }
  );
};

exports.a3TaskStateProgression = async (req, res, next) => {
  const { taskID, acronym } = req.body;

  const results = await new Promise((resolve) => {
    db.query(
      "SELECT state, owner FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
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
  const { owner } = results;
  console.log("currentState: ", currentState);

  if (currentState !== "Doing") {
    res.json("Current state is not Doing!");
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
        return next(new ErrorHandler(err, 500));
      }
    }
  );

  if (newState === "Done") {
    // Update owner
    if (req.body.username !== owner) {
      db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
        req.body.username,
        taskID,
      ]),
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
        };
    }

    // Send email to approvers
    const approverGroup = await new Promise((resolve) => {
      db.query(
        "SELECT permit_done FROM applications WHERE acronym = ?",
        [acronym],
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
          resolve(results[0].permit_done);
        }
      );
    });

    const allApprovers = await new Promise((resolve) => {
      db.query(
        "SELECT accounts_groups.username, email FROM accounts_groups INNER JOIN accounts on accounts_groups.username = accounts.username WHERE acronym = ? AND group_name = ?",
        [acronym, approverGroup],
        (err, results) => {
          if (err) {
            return next(new ErrorHandler(err, 500));
          }
          console.log(results);
          resolve(results);
        }
      );
    });

    for (const approver of allApprovers) {
      sendEmail(
        approver.email,
        `${acronym}: Task promoted to Done`,
        `Task ${taskID} of Application ${acronym} has been promoted to Done by ${req.session.username}.`
      );
    }
  }

  req.body.details = `Task updated from ${currentState} to ${newState}`;

  if (newState === "Closed") {
    req.state = "Done";
  }

  next();
};

exports.a3CreateNotes = async (req, res, next) => {
  if (req.isMember === false) {
    res.json("Not a member");
    return;
  }

  let { details, taskID } = req.body;
  let state = req.state;

  if (!req.state) {
    state = await checkState(taskID);
  }

  if (state === "Closed") {
    res.json("Task is closed!");
    return;
  }

  if (!details) {
    res.json("Please enter some notes");
    return;
  }

  if (!taskID) {
    taskID = req.params.task;
  }

  if (state === "Doing") {
    db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
      req.body.username,
      taskID,
    ]),
      (err, results) => {
        if (err) {
          return next(new ErrorHandler(err, 500));
        }
      };
  }

  const existingNotes = await new Promise((resolve) => {
    db.query(
      "SELECT notes FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next();
        } else {
          resolve(results[0].notes);
        }
      }
    );
  });

  const parsedNotes = JSON.parse(existingNotes);
  let newNotes = [];
  const date = moment(new Date()).format("YYYY-MM-DD");
  const time = new Date().toLocaleTimeString();
  const timestamp = date + " " + time;

  if (existingNotes) {
    newNotes = [
      { details, timestamp, creator: req.body.username, state },
      ...parsedNotes,
    ];
  } else {
    newNotes = [{ details, timestamp, creator: req.body.username, state }];
  }

  db.query(
    "UPDATE tasks SET notes = ? WHERE task_id = ?",
    [JSON.stringify(newNotes), taskID],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
      res.json("Added note");
    }
  );
};
