const express = require("express");
const connectDB = require("./config/db");
const app = express();
const userRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
connectDB();

app.use("/api/user", userRoutes);

app.use("/task", taskRoutes);

app.listen(3000, () => {
  console.log("Running");
});
