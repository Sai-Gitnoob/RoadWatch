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


module.exports = {
  createSession,
};