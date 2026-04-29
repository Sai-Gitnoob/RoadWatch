const { createComplaint: addComplaint } = require("../services/complain.service");

const createComplaint = async (req, res) => {
  try {
    const data = req.body;
    const result = await addComplaint(data);
    res.status(201).json({ success: true, complaint: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createComplaint };