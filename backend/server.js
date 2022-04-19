const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql");
const argon2 = require("argon2");
const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "St3ng12!",
  database: "nodelogin",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

// Inititalize the app and add middleware
// app.use(urlencoded()); // Setup the body parser to handle form submits
app.use(session({ secret: "super-secret" })); // Session setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

/** Simulated bank functionality */
// app.get("/", (req, res) => {
//   res.json("index");
// });

/** Handle login display and form submit */
// app.get("/login", (req, res) => {
//   if (req.session.isLoggedIn === true) {
//     return res.redirect("/");
//   }
//   res.json("login");
// });

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT password, user_group FROM accounts WHERE username = ?",
    username,
    (err, result) => {
      argon2.verify(result[0].password, password).then((argon2Match) => {
        if (argon2Match) {
          req.session.isLoggedIn = true;
          if (result[0].user_group === "Admin") {
            req.session.isAdmin = true;
            res.json({ username, admin: true });
          } else {
            req.session.isAdmin = false;
            res.json({ username, admin: false });
          }
        }
      });
    }
  );
});

/** Handle logout function */
app.get("/logout", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json("User is not logged in!");
    return;
  }
  req.session.isLoggedIn = false;
  req.session.isAdmin = false;
  res.json("Logged out");
});

app.post("/create-account", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json("User is not logged in!");
    return;
  }

  const { username, password, email, group } = req.body;

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
  db.query(
    "INSERT INTO accounts (username, password, email, user_group) VALUES (?, ?, ?, ?)",
    [username, hashedPassword, email, group],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.post("/update-details", async (req, res) => {
  console.log("update details");
  if (!req.session.isLoggedIn) {
    console.log("not logged in");
    res.json("User is not logged in!");
    return;
  }

  console.log(req.body);
  const { field, username } = req.body;
  let { details } = req.body;

  if (field === "password") {
    details = await argon2.hash(details);
  }
  db.query(
    "UPDATE accounts SET ?? = ? WHERE username = ?",
    [field, details, username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.post("/disable-user", (req, res) => {
  if (!req.session.isAdmin) {
    res.json("Unauthorised user");
    return;
  }
  db.query(
    'UPDATE accounts SET status = "Disabled" WHERE username = ?',
    req.body.username,
    (err, result) => {
      if (err) throw err;
      res.json("User disabled");
    }
  );
});

app.get("/balance", (req, res) => {
  if (req.session.isLoggedIn) {
    res.json("Your account balance is $1234.52");
  } else {
    res.json("User is not logged in!");
  }
});

app.get("/account", (req, res) => {
  if (req.session.isLoggedIn) {
    res.json("Your account number is ACL9D42294");
  } else {
    res.json("User is not logged in!");
  }
});

app.get("/contact", (req, res) => {
  res.json("Our address : 321 Main Street, Beverly Hills.");
});

app.get("/all-users", (req, res) => {
  if (!req.session.isAdmin) {
    res.json("Unauthorised user");
    return;
  }

  db.query("SELECT username FROM accounts", (err, result) => {
    res.json(result);
  });
});

/** App listening on port */
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});
