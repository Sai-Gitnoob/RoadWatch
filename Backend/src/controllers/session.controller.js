const {
  createSession,
  processMessage,
} = require("../services/session.service");


// START NEW SESSION
const startSession = async (req, res) => {

  try {

    const userId = req.user.uid;

    const session =
      await createSession(userId);

    res.status(201).json({
      success: true,
      message: "Session started",
      data: session,
    });

  } catch (error) {

    console.error(
      "Session Start Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// SEND MESSAGE
const sendMessage = async (req, res) => {

  try {

    const {
      sessionId,
      message,
    } = req.body;

    // Validation
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message:
          "sessionId and message are required",
      });
    }

    // Process Message
    const result =
      await processMessage(
        sessionId,
        message
      );

    res.status(200).json({
      success: true,
      message: "Message processed",
      data: result,
    });

  } catch (error) {

    console.error(
      "Send Message Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  startSession,
  sendMessage,
};