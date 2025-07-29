const express = require("express");
const router = express.Router();
const multer = require("multer");
const transcriptController = require("../controllers/transcriptController");
const auth = require("../middleware/authMiddleware");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/ask",
  upload.single("file"),
  auth,
  transcriptController.askFromTranscript
);

module.exports = router;
