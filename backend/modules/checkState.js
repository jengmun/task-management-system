const { db } = require("./db");

const checkState = (taskID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT state FROM tasks WHERE task_id = ?",
      taskID,
      (err, results) => {
        if (err) {
          reject(err);
        }
        if (results.length) {
          resolve(results[0].state);
        } else {
          resolve("");
        }
      }
    );
  });
};

module.exports = checkState;
