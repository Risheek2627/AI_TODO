const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
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

    const user = new User({ name, email, password: hashPassword });
    await user.save();

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

    const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
      expiresIn: "1hr",
    });

    return res.status(200).json({ message: "User login successfully", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
