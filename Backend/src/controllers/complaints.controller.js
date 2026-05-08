const { createComplaint: addComplaint } = require("../services/complain.service");

const { db } = require("../config/firebase");

const createComplaint = async (req, res) => {
  try {
    const data = req.body;

    if (!data.description || !data.location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const complaint = {
      description: data.description,
      location: data.location,
      userId: data.userId || "anonymous",
      issueType: data.issueType,
      severity: data.severity,
      status: "pending",
      createdAt: new Date(),
    };

    const docRef = await db.collection("complaints").add(complaint);

    res.status(201).json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const snapshot = await db.collection("complaints").get();

    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
};

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("complaints").doc(id).get();

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("complaints").doc(id).update(req.body);

    res.status(200).json({
      success: true,
      message: "Complaint updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("complaints").doc(id).delete();

    res.status(200).json({
      success: true,
      message: "Complaint deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};

