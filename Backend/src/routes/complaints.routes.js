const express = require("express");
const router = express.Router();
const { createComplaint } = require("../controllers/complaints.controller");

router.post("/", createComplaint);

module.exports = router;