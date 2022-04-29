const { db } = require("./db");

const checkState = async (req, res) => {
  return await new Promise((resolve, reject) => {
    db.query(
      "SELECT state FROM tasks WHERE task_id = ?",
      req.body.task_id,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          res.json("hi");
          console.log(result[0].state);
          resolve(result[0].state);
        }
      }
    );
  });
};

module.exports = checkState;
