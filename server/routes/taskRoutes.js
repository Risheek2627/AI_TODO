const {
  addTask,
  getTask,
  deleteTask,
  updateTask,
} = require("../controllers/taskController");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.post("/addTask", auth, addTask);
router.get("/getTask", auth, getTask);
router.delete("/deleteTask/:id", auth, deleteTask);
router.patch("/updateTask/:id", auth, updateTask);

module.exports = router;
