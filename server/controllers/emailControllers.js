const Task = require("../model/Task");
const User = require("../model/User");
const sendMail = require("../utils/mailer");

const dailyEmail = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tommorow = new Date(today);
    tommorow.setDate(today.getDate() + 1);
    tommorow.setHours(0, 0, 0, 0);

    const overDueDate = new Date(today);
    const users = await User.find();

    for (let user of users) {
      const dailyTasks = await Task.find({
        user: user._id,
        dueDate: { $gt: today, $lte: tommorow },
        completed: false,
      });

      const dueTasks = await Task.find({
        user: user._id,
        dueDate: { $lt: overDueDate },
        completed: false,
      });

      let html = `<h2>Hello ${user.name || "there"},</h2>
  <p>Here's your task summary for today:</p>`;

      if (dailyTasks.length > 0) {
        html += `<h3> Tasks Due Today:</h3><ul>`;
        dailyTasks.forEach((task) => {
          html += `<li>${task.task}</li>`;
        });
        html += `</ul>`;
      }

      if (dueTasks.length > 0) {
        html += `<h3 style="color:red;"> Overdue Tasks:</h3><ul>`;
        dueTasks.forEach((task) => {
          html += `<li>${
            task.task
          } <em>(Due: ${task.dueDate.toDateString()})</em></li>`;
        });
        html += `</ul>`;
      }

      html += `<p style="margin-top:20px;">Stay productive!<br/>- AI Assistant 🤖</p>`;

      console.log(" Reminder Job Executed at", new Date().toLocaleString());
      if (dailyTasks.length > 0 || dueTasks.length > 0) {
        await sendMail(user.email, "Task Reminder !", html);
        console.log(`Email sent to ${user.name} , ${user.email}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = dailyEmail;
