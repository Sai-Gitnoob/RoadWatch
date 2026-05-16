const admin = require("firebase-admin");
const path = require("path");


// Load Firebase Service Account
const serviceAccount = require(
  path.join(__dirname, "../../serviceAccountKey.json")
);


// Prevent Multiple Firebase Initializations
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