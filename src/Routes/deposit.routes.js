const express = require("express");
const {
  createWordsNotification,
} = require("../Controllers/depositController");

const router = express.Router();

// Route for creating a deposit request
router.post("/words", createWordsNotification);



module.exports = router;
