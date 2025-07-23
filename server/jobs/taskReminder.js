const Queue = require("bull");
const Task = require("../model/Task");
const User = require("../model/User");
const sendMail = require("../utils/mailer");

const reminderQueue = new Queue("task-reminder", {
  // where queue comes from bull lirary like bull is background task job (like sending emails , resiszing the images , so it have queues)
  redis: {
    host: "127.0.0.1",
    port: 6379, // Create a new queue named task-reminder that connects to Redis running locally."
  },
});

// Main JOB logic

reminderQueue.process(async (job) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1).toLocaleString();
  // console.log(tomorrow);

  const overDueDate = new Date(today);

  const users = await User.find(); // to get all users

  for (let user of users) {
    const todayTasks = await Task.find({
      user: user._id,
      dueDate: { $gte: today, $lt: tomorrow },
      completed: false,
    });

    const dueTasks = await Task.find({
      user: user._id,
      dueDate: { $lt: overDueDate },
      completed: false,
    });

    // let body = "";

    // if (todayTasks.length > 0) {
    //   body += ` Task Due Today :\n
    //     ${todayTasks
    //       .map((task, i) => `${i + 1} . ${task.task}`)
    //       .join("\n")}\n\n`;
    // }

    // if (dueTasks.length > 0) {
    //   body += `⚠️ Overdue Tasks:\n${dueTasks
    //     .map((t, i) => `${i + 1}. ${t.task} (Due: ${t.dueDate.toDateString()})`)
    //     .join("\n")}`;
    // }

    // if (body) {
    //   await sendMail(user.email, " Daily Task Remainder", body);
    // }
    let html = `<h2>Hello ${user.name || "there"},</h2>
  <p>Here's your task summary for today:</p>`;

    if (todayTasks.length > 0) {
      html += `<h3>✅ Tasks Due Today:</h3><ul>`;
      todayTasks.forEach((task) => {
        html += `<li>${task.task}</li>`;
      });
      html += `</ul>`;
    }

    if (dueTasks.length > 0) {
      html += `<h3 style="color:red;">⏰ Overdue Tasks:</h3><ul>`;
      dueTasks.forEach((task) => {
        html += `<li>${
          task.task
        } <em>(Due: ${task.dueDate.toDateString()})</em></li>`;
      });
      html += `</ul>`;
    }

    html += `<p style="margin-top:20px;">Stay productive!<br/>- AI Assistant 🤖</p>`;

    if (todayTasks.length || dueTasks.length) {
      await sendMail(user.email, "📋 Daily Task Reminder", html);
    }
  }
});
reminderQueue.getRepeatableJobs().then(console.log);

module.exports = reminderQueue;
