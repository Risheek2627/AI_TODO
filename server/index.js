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

const scheduleDailyReminder = async () => {
  try {
    const jobs = await reminderQueue.getRepeatableJobs();
    const alreadyScheduled = jobs.find(
      (job) => job.id === "daily-task-reminder"
    );

    if (!alreadyScheduled) {
      await reminderQueue.add(
        {},
        {
          repeat: { cron: "09 22 * * *" },
          tz: "Asia/Kolkata", // 8:38 AM IST
          jobId: "daily-task-reminder",
        }
      );
    } else {
      console.log(" Job already scheduled:", alreadyScheduled);
    }

    const updatedJobs = await reminderQueue.getRepeatableJobs();
    console.log("Current repeatable jobs:", updatedJobs);
  } catch (err) {
    console.error("Error scheduling job:", err);
  }
};

scheduleDailyReminder();

app.listen(3000, () => {
  console.log("✅ Server Running on port 3000");
});
