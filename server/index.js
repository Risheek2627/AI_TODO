const express = require("express");
const connectDB = require("./config/db");
const app = express();
const userRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");
const progressRoutes = require("./routes/progressRoutes");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/user", userRoutes);

app.use("/task", taskRoutes);

app.use("/ai", aiRoutes);

app.use("/api", progressRoutes);
app.listen(3000, () => {
  console.log("Running");
});
