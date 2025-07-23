const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

console.log(process.env.EMAIL_USER);
console.log(process.env.jwt_secret);
const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendMail = async (to, subject, html) => {
  await transpoter.sendMail({
    from: `AI Assistant  <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;
