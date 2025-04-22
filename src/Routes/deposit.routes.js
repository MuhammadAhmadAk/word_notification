const express = require("express");
const {
  createWordsNotification,
  getWordHistory,
} = require("../Controllers/depositController");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Server is running");
});
router.post("/words", createWordsNotification);
router.get("/words/history", getWordHistory);

module.exports = router;
