const Task = require("../model/Task");

// add Task
const addTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task, dueDate } = req.body;

    const newTask = new Task({ user: userId, task, dueDate });

    await newTask.save();

    return res.status(200).json({ message: "Task added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// getTasks
const getTask = async (req, res) => {
  try {
    const task = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    if (task.length === 0) {
      return res.status(401).json({ message: "No tasks" });
    }
    return res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// delete Task

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfullys" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task updated successfullys" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addTask, getTask, deleteTask, updateTask };
