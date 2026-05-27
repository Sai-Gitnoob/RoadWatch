const express = require("express");
const cors = require("cors");
const sessionRoutes = require("./routes/session.routes");
const complaintRoutes = require("./routes/complaints.routes");

const app = express();
const authRoutes = require("./routes/auth.routes");

// Middlewares
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RoadWatch API running",
  });
});
app.use("/api/session", sessionRoutes);

module.exports = app;