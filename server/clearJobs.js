// clearJobs.js
const reminderQueue = require("./jobs/taskReminder");

(async () => {
  const jobs = await reminderQueue.getRepeatableJobs();
  console.log("Jobs found: ", jobs.length);

  for (let job of jobs) {
    await reminderQueue.removeRepeatableByKey(job.key);
    console.log(`🗑️ Removed: ${job.key}`);
  }

  process.exit(0);
})();
