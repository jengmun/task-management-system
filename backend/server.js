const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { db } = require("./modules/db");

const app = express();
const port = 5000;

app.use(session({ secret: "super-secret" }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Controllers

const userController = require("./controllers/userController.js");
const adminController = require("./controllers/adminController");
app.use("/user", userController);
app.use("/admin", adminController);

// Connect to port and DB

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
  // db.query(
  //   `CREATE TABLE IF NOT EXISTS accounts (username VARCHAR(50) NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(100) NOT NULL, account_type VARCHAR(45) NOT NULL DEFAULT 'User', status VARCHAR(45) NOT NULL DEFAULT 'Active', PRIMARY KEY (username)) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8`
  // );
  // db.query(
  //   `INSERT INTO accounts (username, password, email, account_type) VALUES ("admin", "admin", "admin@admin.com", "Admin") WHERE NOT EXISTS (SELECT * FROM accounts WHERE username = "admin")`
  // );
});

app.listen(port, () => {
  console.log(`Connected to http://localhost:${port}`);
});

// app.use(urlencoded()); // Setup the body parser to handle form submits

const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "jarred.walsh37@ethereal.email", // generated ethereal user
      pass: "7jh2Je1arxW8VQXcps", // generated ethereal password
    },
  });

  // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);
