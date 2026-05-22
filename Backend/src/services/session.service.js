const { db } = require("../config/firebase");


// CREATE SESSION
const createSession = async (userId) => {

  // Generate session ID
  const sessionId =
    `sess_${Date.now()}`;

  // Session Object
  const sessionData = {

    sessionId,

    userId,

    status: "collecting",

    complaintData: {
      issueType: null,
      location: null,
      severity: null,
      description: null,
      landmark: null,
    },

    missingFields: [
      "issueType",
      "location",
      "severity",
      "description",
    ],

    messages: [],

    createdAt: new Date(),

    updatedAt: new Date(),
  };

  // Save to Firestore
  await db
    .collection("complaint_sessions")
    .doc(sessionId)
    .set(sessionData);

  return sessionData;
};


// PROCESS MESSAGE
const processMessage = async (
  sessionId,
  message
) => {

  // Get Session
  const sessionRef = db
    .collection("complaint_sessions")
    .doc(sessionId);

  const sessionDoc =
    await sessionRef.get();

  // Check session exists
  if (!sessionDoc.exists) {
    throw new Error("Session not found");
  }

  // Session Data
  const session =
    sessionDoc.data();

  // Append User Message
  session.messages.push({
    sender: "user",
    text: message,
    timestamp: new Date(),
  });

  // Simple AI Field Detection

  // Detect Severity
  if (
    message.toLowerCase().includes("high")
  ) {
    session.complaintData.severity =
      "high";

    session.missingFields =
      session.missingFields.filter(
        (field) =>
          field !== "severity"
      );
  }

  // Detect Location
  if (
    message.toLowerCase().includes("andheri")
  ) {
    session.complaintData.location =
      "Andheri";

    session.missingFields =
      session.missingFields.filter(
        (field) =>
          field !== "location"
      );
  }

  // Detect Issue Type
if (
  message.toLowerCase().includes("pothole")
) {
  session.complaintData.issueType =
    "Pothole";

  session.missingFields =
    session.missingFields.filter(
      (field) =>
        field !== "issueType"
    );
}
  // Detect Description
  if (message.length > 10) {

    session.complaintData.description =
      message;

    session.missingFields =
      session.missingFields.filter(
        (field) =>
          field !== "description"
      );
  }

  // Generate AI Reply
  let aiReply =
    "Please provide more details.";

  if (
    session.missingFields.length > 0
  ) {

    aiReply =
      `Please provide ${session.missingFields[0]}`;

  } else {

    aiReply =
      "Complaint information completed successfully.";
  }

  // Save AI Message
  session.messages.push({
    sender: "ai",
    text: aiReply,
    timestamp: new Date(),
  });

  // Update Timestamp
  session.updatedAt =
    new Date();

  // Save Updated Session
  await sessionRef.update(session);

  return {
    sessionId,
    complaintData:
      session.complaintData,
    missingFields:
      session.missingFields,
    aiReply,
    messages:
      session.messages,
  };
};


module.exports = {
  createSession,
  processMessage,
};