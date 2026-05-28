const admin = require("firebase-admin");


// Firebase Credentials from ENV
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};


// Prevent Multiple Initializations
if (!admin.apps.length) {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin Initialized");
}


// Firestore Database
const db = admin.firestore();


// Exports
module.exports = {
  admin,
  db,
};