const { db } = require("../config/firebase");

exports.createComplaint = async (data) => {
  if (!data.description || !data.location) {
    throw new Error("Missing required fields");
  }

  const complaint = {
    description: data.description,
    location: data.location,
    userId: data.userId || "anonymous",
    status: "pending",
    createdAt: new Date(),
  };

  const docRef = await db.collection("complaints").add(complaint);

  return {
    message: "Complaint created",
    id: docRef.id,
    complaint,
  };
};
