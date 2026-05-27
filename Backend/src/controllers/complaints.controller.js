const { db } = require("../config/firebase");
const Airtable = require("airtable");

let base;
if (process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID) {
  base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);
}


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
      userId: (data.user && data.user.uid) || (req.user && req.user.uid) || null,
      description: data.description,
      location: data.location,
      latitude: data.lat || data.latitude || null,
      longitude: data.lng || data.longitude || null,
      city: data.city || "Mumbai",
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

    let snapshot;
    if (req.user.role === "admin") {
      snapshot = await db.collection("complaints").get();
    } else {
      snapshot = await db
        .collection("complaints")
        .where("userId", "==", req.user.uid)
        .get();
    }

    const complaints = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Handle Firestore Timestamps uniformly
      ['createdAt', 'updatedAt', 'assignedAt', 'inProgressAt', 'resolvedAt'].forEach(field => {
        if (data[field] && typeof data[field].toDate === 'function') {
          data[field] = data[field].toDate().toISOString();
        }
      });
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

    const data = doc.data();
    ['createdAt', 'updatedAt', 'assignedAt', 'inProgressAt', 'resolvedAt'].forEach(field => {
      if (data[field] && typeof data[field].toDate === 'function') {
        data[field] = data[field].toDate().toISOString();
      }
    });

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...data,
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
      "assigned",
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

    const currentData = doc.data();
    const currentStatus = currentData.status || "pending";

    // Strict One-Way Status Flow Validation
    if (currentStatus === "resolved") {
      return res.status(400).json({ success: false, message: "Complaint is already resolved and immutable" });
    }
    
    if (status === "assigned" && currentStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Can only mark assigned from pending" });
    }
    if (status === "in-progress" && currentStatus !== "assigned") {
      return res.status(400).json({ success: false, message: "Can only mark in-progress from assigned" });
    }
    if (status === "resolved" && currentStatus !== "in-progress") {
      return res.status(400).json({ success: false, message: "Can only mark resolved from in-progress" });
    }

    // Update status with timeline timestamps
    const updateData = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === "assigned") updateData.assignedAt = new Date();
    if (status === "in-progress") updateData.inProgressAt = new Date();
    if (status === "resolved") updateData.resolvedAt = new Date();

    await complaintRef.update(updateData);

    // Sync status to Airtable if configured
    if (base && currentData.ticketId) {
      try {
        const tableName = process.env.AIRTABLE_TABLE_NAME || "Issues";
        const records = await base(tableName).select({
          filterByFormula: `{ticket_id} = '${currentData.ticketId}'`,
          maxRecords: 1
        }).firstPage();

        if (records && records.length > 0) {
          const recordId = records[0].id;
          await base(tableName).update(recordId, {
            status: status
          });
          console.log(`Successfully synced status ${status} to Airtable for ticket ${currentData.ticketId}`);
        } else {
          console.warn(`Airtable sync warning: No record found with ticket_id = ${currentData.ticketId}`);
        }
      } catch (airtableErr) {
        console.error("Failed to sync status to Airtable:", airtableErr);
      }
    }

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