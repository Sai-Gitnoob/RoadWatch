const express = require("express");
const cors = require("cors");

const complaintRoutes = require("./routes/complaints.routes");

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/complaints", complaintRoutes);


// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RoadWatch API running",
  });
});


module.exports = app;