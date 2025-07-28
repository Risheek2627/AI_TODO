const reminderQueue = require("./Queue");

const dailyEmail = require("../controllers/emailControllers");

reminderQueue.process("daily-task-reminder", async (job) => {
  console.log("I am running process");
  const name = job.name;
  console.log(name);
  switch (name) {
    case "daily-task-reminder":
      console.log("daily reminder job");
      await dailyEmail();
      break;
    default:
      console.log("Unknow type of job ", name);
  }
});
