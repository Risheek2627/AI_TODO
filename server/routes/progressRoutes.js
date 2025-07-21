const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getWeeklyProgress,
  dailyProgress,
} = require("../controllers/weekProgress");

router.post("/weekProgress", auth, getWeeklyProgress);
router.post("/dailyProgress", auth, dailyProgress);

module.exports = router;
