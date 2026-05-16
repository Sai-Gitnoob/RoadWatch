const express = require("express");

const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require("../controllers/complaints.controller");


// CREATE COMPLAINT
// POST /api/complaints
router.post("/", createComplaint);


// GET ALL COMPLAINTS
// GET /api/complaints
router.get("/", getComplaints);


// GET SINGLE COMPLAINT
// GET /api/complaints/:id
router.get("/:id", getComplaintById);


// UPDATE ONLY STATUS
// PUT /api/complaints/:id/status
router.put("/:id/status", updateComplaintStatus);


module.exports = router;