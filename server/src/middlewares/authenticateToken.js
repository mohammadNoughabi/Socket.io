const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  // 1️⃣ First, try to get token from cookies
  let token = req.cookies?.token;

  // 2️⃣ If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // 3️⃣ If no token, block request
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // 4️⃣ Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Attach decoded user data to request
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
