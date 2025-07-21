const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getWeeklyProgress } = require("../controllers/weekProgress");

router.post("/weekProgress", auth, getWeeklyProgress);

module.exports = router;
