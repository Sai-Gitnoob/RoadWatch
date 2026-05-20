const jwt = require("jsonwebtoken");


const protect = async (req, res, next) => {

  try {

    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach user to request
    req.user = decoded;

    next();

  } catch (error) {

    console.error("Auth Middleware Error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};


module.exports = protect;