const checkState = require("../modules/checkState");
const { db } = require("../modules/db");

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

exports.createPlan = (req, res, next) => {
  db.query(
    "INSERT INTO plans VALUES (?, ?, ?, ?)",
    [req.body.planName, req.body.startDate, req.body.endDate, req.body.acronym],
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
    "INSERT INTO tasks (task_id, task_name, description, notes, plan_name, acronym, state, creator) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      `${req.body.acronym.toUpperCase()}_${runningNumber}`,
      req.body.taskName,
      req.body.description,
      req.body.notes,
      req.body.planName,
      req.body.acronym.toUpperCase(),
      "Open",
      req.body.creator,
    ],
    (err, results) => {
      if (err) {
        next(err);
      } else {
        console.log(results);
      }
    }
  );

  db.query(
    "UPDATE applications SET running_number = ?",
    runningNumber + 1,
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
  const { taskID } = req.body;

  const results = await new Promise((resolve) => {
    db.query(
      "SELECT state, creator FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.length) {
          resolve(results[0]);
        } else {
          resolve({ state: "", creator: "" });
        }
      }
    );
  });

  const currentState = results.state;
  const creator = results.creator;

  if (currentState === "Closed" || !currentState) {
    res.json("State can't be updated!");
    return;
  }

  if (creator === req.session.username) {
    res.json("Creator can't be assigned the task!");
    return;
  }

  const newState = listOfStates[listOfStates.indexOf(currentState) + 1];

  db.query(
    "UPDATE tasks SET state = ? WHERE task_id = ?",
    [newState, taskID],
    (err, results) => {
      if (err) {
        return next(err);
      }
    }
  );

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
  const { details, creator, taskID } = req.body;

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
      creator,
      state,
      taskID,
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json(results);
    }
  );
};

exports.updateTask = (req, res, next) => {};