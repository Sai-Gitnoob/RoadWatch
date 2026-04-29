const express = require("express");
const cors = require("cors");
const complaintRoutes = require("./routes/complaints.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/complaints", complaintRoutes);

app.get("/", (req, res) => {
  res.send("RoadWatch API running");
});

module.exports = app;