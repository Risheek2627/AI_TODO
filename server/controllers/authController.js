const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const sendMail = require("../utils/mailer");
const fs = require("fs");
const Task = require("../model/Task");
const path = require("path");
const html = fs.readFileSync(
  path.join(__dirname, "../Email/welcomeEmail.html"),
  "utf8"
);
dotenv.config();

// register
const register = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Password received:", req.body.password);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(401).json({ message: "User already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const idUser = "6880b5d285904e9a6c5ed024";
    const deleteTask = await Task.deleteMany({ user: idUser });

    const user = new User({ name, email, password: hashPassword });
    await user.save();
    const personalizedHtml = html.replace(
      '${user.name || "there"}',
      user.name || "there"
    );

    let body = `
    <h2>Hello ${user.name || "there"},</h2>
  <p>Thanks for joining  our FlowBuddy! Your personal AI assistant is ready to help you tackle your todo list smarter

    Start by adding a few tasks and watch the AI suggestions come to life.
    This emphasizes the AI benefit while keeping it short and actionable</p>
  `;
    sendMail(user.email, "Welcome To Our FlowBuddy!!", personalizedHtml);
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // In authController.js login function
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "User login successfully", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
