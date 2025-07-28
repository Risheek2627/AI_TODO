const Queue = require("bull");

const reminderQueue = new Queue("task-reminder", {
  // where queue comes from bull lirary like bull is background task job (like sending emails , resiszing the images , so it have queues)
  redis: {
    host: "127.0.0.1",
    port: 6379, // Create a new queue named task-reminder that connects to Redis running locally."
  },
});

module.exports = reminderQueue;
