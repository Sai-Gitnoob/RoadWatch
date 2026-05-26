const { db } = require("../config/firebase");


// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {

    const data = req.body;

    // Validation
    if (!data.description || !data.location) {
      return res.status(400).json({
        success: false,
        message: "Description and location are required",
      });
    }

    // Complaint Object
    const complaint = {
      ticketId: data.ticketId || `c-${Date.now()}`,
      roadName: data.roadName || data.location?.split(",")[0] || "Unknown Road",
      userId: req.user.uid,
      description: data.description,
      location: data.location,
      issueType: data.issueType || "General",
      severity: data.severity || "medium",
      status: data.status || "pending",
      source: data.source || "manual",
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

    const snapshot = await db
      .collection("complaints")
      .where("userId", "==", req.user.uid)
      .get();

    const complaints = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Handle Firestore Timestamps
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return {
        id: doc.id,
        ...data,
      };
    });

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