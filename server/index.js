const express = require("express");
const connectDB = require("./config/db");
const app = express();

const reminderQueue = require("./jobs/taskReminder");
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

const scheduleDailyReminder = () => {
  reminderQueue.add(
    {},
    {
      repeat: { cron: "*/1 * * * *" },
      jobId: "daily-task-reminder",
    }
  );
};
// scheduleDailyReminder();
app.listen(3000, () => {
  console.log("Running");
});
