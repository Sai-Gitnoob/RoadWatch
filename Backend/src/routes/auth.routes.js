const express = require("express");

const router = express.Router();

const {
  signup,
} = require("../controllers/auth.controller");


// SIGNUP
// POST /api/auth/signup
router.post("/signup", signup);


module.exports = router;