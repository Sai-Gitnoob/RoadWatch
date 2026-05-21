const {
  createSession,
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


module.exports = {
  startSession,
};