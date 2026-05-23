const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  signup,
  login,
  getCurrentUser,
  getProfile,
} = require("../controllers/auth.controller");


// SIGNUP
// POST /api/auth/signup/login
router.post("/signup", signup);
router.post("/login", login);

router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, getProfile);

module.exports = router;