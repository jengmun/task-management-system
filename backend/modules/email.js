const nodemailer = require("nodemailer");

const emailNewPassword = async (email, header, content) => {
  const transporter = nodemailer.createTransport({
    name: "Admin",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "testtesttest12305@gmail.com",
      pass: "Testtesttest123",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Admin" <testtesttest12305@gmail.com>', // sender address
    to: email, // list of receivers
    subject: header, // Subject line
    text: content, // plain text body
    html: `<html>${content}</html>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = emailNewPassword;
