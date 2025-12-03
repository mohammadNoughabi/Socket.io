const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const socketHandlers = require("./handlers");

module.exports = function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id,
        username: decoded.username,
      };

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Register handlers
  io.on("connection", (socket) => socketHandlers(io, socket));
};
