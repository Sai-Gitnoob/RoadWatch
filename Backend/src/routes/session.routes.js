const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  startSession,
} = require("../controllers/session.controller");


// START SESSION
// POST /api/session/start
router.post(
  "/start",
  protect,
  startSession
);


module.exports = router;