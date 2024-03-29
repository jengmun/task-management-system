const checkState = require("../modules/checkState");
const { db } = require("../modules/db");
const sendEmail = require("../modules/email");
const checkGroup = require("../modules/checkGroup");
const moment = require("moment");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

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
        res.json({ message: "Application successfully created" });
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

exports.uncreatedApplications = catchAsyncErrors(async (req, res, next) => {
  const assignedApps = await new Promise((resolve, reject) => {
    db.query(
      "SELECT DISTINCT acronym FROM accounts_groups WHERE username = ?",
      req.session.username,
      (err, result) => {
        if (err) {
          reject(err);
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
});

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
        res.json({ message: "Updated app" });
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
        res.json({ message: "Plan created" });
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
          res.json({ message: "Plan updated" });
        } else {
          return next(new ErrorHandler("No open plan found!", 404));
        }
      }
    }
  );
};

exports.updatePlanStatus = catchAsyncErrors(async (req, res, next) => {
  const allTasksClosed = await new Promise((resolve, reject) => {
    db.query(
      "SELECT task_id FROM tasks WHERE plan_name = ? AND acronym = ? AND state != 'Closed'",
      [req.body.planName, req.params.app],
      (err, results) => {
        if (err) {
          reject(err);
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
          res.json({ message: "Plan status updated" });
        }
      }
    );
  } else {
    return next(new ErrorHandler("There are pending open tasks", 500));
  }
});

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

exports.createTask = catchAsyncErrors(async (req, res, next) => {
  if (req.body.planName) {
    const validPlan = await new Promise((resolve, reject) => {
      db.query(
        `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ? AND status = 'Open'`,
        [req.body.acronym, req.body.planName],
        (err, result) => {
          if (err) {
            reject(err);
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
      return next(new ErrorHandler("No valid open plan found!", 500));
    }
  }

  const runningNumber = await new Promise((resolve, reject) => {
    db.query(
      "SELECT running_number FROM applications WHERE acronym = ?",
      [req.body.acronym],
      (err, results) => {
        if (err) {
          reject(err);
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
          "UPDATE applications SET running_number = ? WHERE acronym = ?",
          [runningNumber + 1, req.body.acronym],
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
});

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

exports.hasPermissions = catchAsyncErrors(async (req, res, next) => {
  const { app, permission } = req.body;

  const appDetails = await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM applications WHERE acronym = ?",
      [app],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });

  if (!appDetails) {
    return next(new ErrorHandler("App does not exist", 404));
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
});

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
      res.json({ message: "Permissions updated" });
    }
  );
};

const listOfStates = ["Open", "Todo", "Doing", "Done", "Closed"];

exports.taskStateProgression = catchAsyncErrors(async (req, res, next) => {
  const { taskID, acronym } = req.body;

  const results = await new Promise((resolve, reject) => {
    db.query(
      "SELECT state, creator, owner FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length) {
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
    return next(new ErrorHandler("State can't be updated!", 500));
  }

  if (creator === req.session.username && currentState === "Open") {
    return next(
      new ErrorHandler("Approver cannot be the creator of the task!", 401)
    );
  }

  if (owner === req.session.username && currentState === "Done") {
    return next(
      new ErrorHandler("Checker cannot be the owner of the task!", 401)
    );
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

  // Send email to approvers
  if (newState === "Done") {
    const approverGroup = await new Promise((resolve, reject) => {
      db.query(
        "SELECT permit_done FROM applications WHERE acronym = ?",
        [acronym],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0].permit_done);
          }
        }
      );
    });

    const allApprovers = await new Promise((resolve, reject) => {
      db.query(
        "SELECT accounts_groups.username, email FROM accounts_groups INNER JOIN accounts on accounts_groups.username = accounts.username WHERE acronym = ? AND group_name = ?",
        [acronym, approverGroup],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            console.log(results);
            resolve(results);
          }
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
});

exports.taskStateRegression = catchAsyncErrors(async (req, res, next) => {
  const { taskID } = req.body;

  const currentState = await checkState(taskID);

  // Only can demote from Done to Doing and Doing to Todo
  if (currentState !== "Doing" && currentState !== "Done") {
    return next(new ErrorHandler("State can't be demoted!", 500));
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

  req.body.details = `Task updated from ${currentState} to ${newState}`;

  next();
});

exports.createNotes = catchAsyncErrors(async (req, res, next) => {
  let { details, taskID } = req.body;
  let state = req.state;

  if (!req.state) {
    state = await checkState(taskID);
  }

  if (state === "Closed") {
    return next(new ErrorHandler("Task is closed!", 500));
  }

  if (!details) {
    return next(new ErrorHandler("Please enter some notes", 400));
  }

  if (!taskID) {
    taskID = req.params.task;
  }

  db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
    req.session.username,
    taskID,
  ]),
    (err, results) => {
      if (err) {
        return next(new ErrorHandler(err, 500));
      }
    };

  const existingNotes = await new Promise((resolve, reject) => {
    db.query(
      "SELECT notes FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          reject(err);
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
      res.json({ message: "Added note" });
    }
  );
});

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

exports.isGroup = catchAsyncErrors(async (req, res, next) => {
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
});

// ================= ASSIGNMENT 3 ================= //

exports.a3AllAppTasksByState = catchAsyncErrors(async (req, res, next) => {
  const { app, state } = req.params;

  if (!listOfStates.includes(state)) {
    return next(new ErrorHandler("Error 304", 400));
  }

  await new Promise((resolve, reject) => {
    db.query(
      "SELECT acronym FROM applications WHERE acronym = ?",
      app,
      (err, results) => {
        if (err) {
          reject(new ErrorHandler("Error 500", 500));
        } else if (!results.length) {
          reject(new ErrorHandler("Error 303", 400));
        } else {
          resolve(true);
        }
      }
    );
  });

  db.query(
    "SELECT * FROM tasks WHERE acronym = ? AND state = ?",
    [app, state],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler());
      }
      res.json(results);
    }
  );
});

exports.a3CreateTask = catchAsyncErrors(async (req, res, next) => {
  if (req.body.planName) {
    const validPlan = await new Promise((resolve, reject) => {
      db.query(
        `SELECT plan_name FROM plans WHERE acronym = ? AND plan_name = ? AND status = 'Open'`,
        [req.body.acronym, req.body.planName],
        (err, result) => {
          if (err) {
            reject(err);
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
      return next(new ErrorHandler("Error 302", 400));
    }
  }

  if (!req.body.taskName || !req.body.description) {
    return next(new ErrorHandler("Error 305", 400));
  }

  const runningNumber = await new Promise((resolve, reject) => {
    db.query(
      "SELECT running_number FROM applications WHERE acronym = ?",
      [req.body.acronym],
      (err, results) => {
        if (err) {
          reject(err);
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
      req.params.username,
    ],
    (err) => {
      if (err) {
        return next(new ErrorHandler());
      } else {
        db.query(
          "UPDATE applications SET running_number = ? WHERE acronym = ?",
          [runningNumber + 1, req.body.acronym],
          (err, results) => {
            if (err) {
              return next(new ErrorHandler());
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
});

exports.a3TaskStateProgression = catchAsyncErrors(async (req, res, next) => {
  const { taskID, acronym } = req.body;

  const results = await new Promise((resolve, reject) => {
    db.query(
      "SELECT state FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length) {
          resolve(results[0]);
        } else {
          resolve({ state: "" });
        }
      }
    );
  });

  const currentState = results.state;
  console.log("currentState: ", currentState);

  if (currentState !== "Doing") {
    return next(new ErrorHandler("Error 401", 400));
  }

  const newState = listOfStates[listOfStates.indexOf(currentState) + 1];
  console.log("New state:", newState);

  // Update task state
  db.query(
    "UPDATE tasks SET state = ? WHERE task_id = ?",
    [newState, taskID],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler());
      }
    }
  );

  // Send email to approvers
  if (newState === "Done") {
    const approverGroup = await new Promise((resolve, reject) => {
      db.query(
        "SELECT permit_done FROM applications WHERE acronym = ?",
        [acronym],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0].permit_done);
          }
        }
      );
    });

    const allApprovers = await new Promise((resolve, reject) => {
      db.query(
        "SELECT accounts_groups.username, email FROM accounts_groups INNER JOIN accounts on accounts_groups.username = accounts.username WHERE acronym = ? AND group_name = ?",
        [acronym, approverGroup],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            console.log(results);
            resolve(results);
          }
        }
      );
    });

    for (const approver of allApprovers) {
      sendEmail(
        approver.email,
        `${acronym}: Task promoted to Done`,
        `Task ${taskID} of Application ${acronym} has been promoted to Done by ${req.params.username}.`
      );
    }
  }

  req.body.details = `Task updated from ${currentState} to ${newState}`;

  if (newState === "Closed") {
    req.state = "Done";
  }

  next();
});

exports.a3CreateNotes = catchAsyncErrors(async (req, res, next) => {
  let { details, taskID } = req.body;
  let state = req.state;

  if (!req.state) {
    state = await checkState(taskID);
  }

  if (state === "Closed") {
    return next(new ErrorHandler("Error 401", 500));
  }

  if (!details) {
    return next(new ErrorHandler("Please enter some notes", 400));
  }

  db.query("UPDATE tasks SET owner = ? WHERE task_id = ?", [
    req.params.username,
    taskID,
  ]),
    (err, results) => {
      if (err) {
        return next(new ErrorHandler());
      }
    };

  const existingNotes = await new Promise((resolve, reject) => {
    db.query(
      "SELECT notes FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          reject(err);
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
      { details, timestamp, creator: req.params.username, state },
      ...parsedNotes,
    ];
  } else {
    newNotes = [{ details, timestamp, creator: req.params.username, state }];
  }

  db.query(
    "UPDATE tasks SET notes = ? WHERE task_id = ?",
    [JSON.stringify(newNotes), taskID],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler());
      }
      res.status(201).json({ message: req.body.details || "Added note" });
    }
  );
});
