// testEmail.js
// const dotenv = require("dotenv").config(); // Load .env

const sendMail = require("./utils/mailer"); // Adjust path if needed

const run = async () => {
  try {
    await sendMail(
      "risheek2627@gmail.com",
      "✅ Test Email",
      "Hello Risheek! This is a test 🚀"
    );
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

run();
