const reminderQueue = require("./Queue");

const scheduleJob = async () => {
  const jobs = await reminderQueue.getRepeatableJobs();
  console.log("Current Jobs : ", jobs);
  const jobName = jobs.map((job) => job.name);
  console.log(
    "Jobs found:",
    jobs.map((j) => ({ id: j.id, name: j.name }))
  );
  // Schedule daily task reminder (every day at 8 AM)

  if (!jobName.includes("daily-task-reminder")) {
    await reminderQueue.add(
      "daily-task-reminder",
      {},
      {
        repeat: { cron: "*/1 * * * *" },
        tz: "Asia/Kolkata",
      }
    );
  } else {
    console.log("Not scheduled");
  }
  console.log("Currents Tasks", jobs);
};

// give same code below if you wanna do any other schedule task (for ex : weekily schedule like that)

module.exports = scheduleJob;
