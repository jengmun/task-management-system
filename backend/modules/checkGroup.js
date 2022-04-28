const { db } = require("./db");

const checkGroup = async (table, username, field, group_name) => {
  return await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM ?? WHERE username = ? AND ?? = ?",
      [table, username, field, group_name],
      (err, result) => {
        if (err) {
          reject(err);
        }
        if (result.length) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
};

module.exports = checkGroup;
