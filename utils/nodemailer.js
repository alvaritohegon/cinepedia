const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // o el proveedor que uses
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
