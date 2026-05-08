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