const { createUser } = require("../services/auth.service");


const signup = async (req, res) => {
  try {

    const {
      name,
      email,
      dob,
      password,
    } = req.body;

    // Validation
    if (!name || !email || !dob || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await createUser({
      name,
      email,
      dob,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });

  } catch (error) {

    console.error("Signup Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  signup,
};