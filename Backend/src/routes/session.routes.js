const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  startSession,
  sendMessage,
} = require("../controllers/session.controller");


// START SESSION
// POST /api/session/start
router.post(
  "/start",
  protect,
  startSession
);


// SEND MESSAGE TO SESSION
// POST /api/session/message
router.post(
  "/message",
  protect,
  sendMessage
);


module.exports = router;