const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  signup,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");


// SIGNUP
// POST /api/auth/signup/login
router.post("/signup", signup);
router.post("/login", login);

router.get("/me", protect, getCurrentUser);

module.exports = router;