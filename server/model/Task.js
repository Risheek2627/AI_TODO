const mongoose = require("mongoose");

const taskScehma = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    task: {
      type: String,
      required: true,
    },

    dueDate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskScehma);

module.exports = Task;
