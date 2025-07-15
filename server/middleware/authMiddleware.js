const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../model/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(404).json({ message: "No auth" });
    }

    const decode = jwt.verify(token, process.env.jwt_secret);
    const userId = decode.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Token is invalid or incorrect" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
