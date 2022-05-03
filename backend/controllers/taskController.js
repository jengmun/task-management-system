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
      req.body.state,
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

exports.updatePermissions = () => {};

exports.updateTask = (req, res, next) => {};

exports.updateTaskState = (req, res, next) => {};

exports.createNotes = (req, res, next) => {
  db.query("");
};
