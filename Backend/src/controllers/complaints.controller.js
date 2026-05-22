const { db } = require("../config/firebase");


// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {

    const data = req.body;

    // Get logged-in user from JWT middleware
    const userId = req.user?.id;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // Validation
    if (
      !data.description ||
      !data.description.trim() ||
      !data.location
    ) {
      return res.status(400).json({
        success: false,
        message: "Description and location are required",
      });
    }

    // Complaint Object
    const complaint = {
      userId: userId,
      description: data.description.trim(),
      location: data.location,
      issueType: data.issueType || "General",
      severity: data.severity || "medium",
      status: "pending",
      createdAt: new Date(),
    };

    // Save to Firebase
    const docRef = await db.collection("complaints").add(complaint);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: {
        id: docRef.id,
        ...complaint,
      },
    });

  } catch (error) {

    console.error("Create Complaint Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET ALL COMPLAINTS
const getComplaints = async (req, res) => {
  try {

    const snapshot = await db.collection("complaints").get();

    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });

  } catch (error) {

    console.error("Get Complaints Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// GET COMPLAINT BY ID
const getComplaintById = async (req, res) => {
  try {

    const { id } = req.params;

    const doc = await db.collection("complaints").doc(id).get();

    // Check if complaint exists
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });

  } catch (error) {

    console.error("Get Complaint By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    // Allowed status values
    const allowedStatus = [
      "pending",
      "in-progress",
      "resolved",
    ];

    // Validate status
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Check if complaint exists
    const complaintRef = db.collection("complaints").doc(id);

    const doc = await complaintRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Update status
    await complaintRef.update({
      status,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
    });

  } catch (error) {

    console.error("Update Complaint Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// EXPORTS
module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
};