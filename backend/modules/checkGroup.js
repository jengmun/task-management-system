const { db } = require("./db");

const checkGroup = (table, username, field, group_name, acronym) => {
  let sql = "SELECT * FROM ?? WHERE username = ? AND ?? = ?";
  const parameters = [table, username, field, group_name];

  if (acronym) {
    sql += " AND acronym = ?";
    parameters.push(acronym);
  }

  return new Promise((resolve, reject) => {
    db.query(sql, parameters, (err, result) => {
      if (err) {
        reject(err);
      } else if (result.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

module.exports = checkGroup;
