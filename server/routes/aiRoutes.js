const express = require("express");
const {
  analyzeInput,
  suggestPriority,
  motivateUser,
  handleAiChat,
} = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
// router.use(authMiddleware);

router.post("/analyze", auth, analyzeInput);
router.get("/suggest", auth, suggestPriority);
router.get("/motivate", auth, motivateUser);

router.post("/chat", auth, handleAiChat);

module.exports = router;
