const express = require("express");
const nlp = require("../controllers/nlpController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
// router.use(authMiddleware);

router.post("/nlp", auth, nlp);

module.exports = router;
