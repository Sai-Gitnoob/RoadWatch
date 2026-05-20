const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");

const generateUserId = require("../utils/generateUserId");


const createUser = async (userData) => {

  const {
    name,
    email,
    dob,
    password,
  } = userData;

  // Check if user already exists
  const existingUser = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!existingUser.empty) {
    throw new Error("User already exists");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate Custom User ID
  const uid = generateUserId(name);

  // User Object
  const user = {
    uid,
    name,
    email,
    dob,
    password: hashedPassword,
    role: "user",
    createdAt: new Date(),
  };

  // Save User
  const docRef = await db.collection("users").add(user);

  return {
    id: docRef.id,
    uid,
    name,
    email,
    role: "user",
  };
};


const loginUser = async (email, password) => {

  // Find user by email
  const snapshot = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  // User not found
  if (snapshot.empty) {
    throw new Error("Invalid email or password");
  }

  // Get user document
  const userDoc = snapshot.docs[0];

  const user = userDoc.data();

  // Compare password
  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Success Response
  return {
    id: userDoc.id,
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  createUser,
  loginUser,
};