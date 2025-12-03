let onlineUsers = new Map();

function socketHandlers(io, socket) {
  const user = socket.user;

  console.log(`User connected: ${user.username} (${socket.id})`);

  // Add user
  onlineUsers.set(user.id, {
    id: user.id,
    username: user.username,
    socketId: socket.id,
  });

  io.emit("online users", Array.from(onlineUsers.values()));

  // public messages
  socket.on("public message", (msg) => {
    // Find the sender's info using the socket.user object set on connection
    const senderInfo = onlineUsers.get(user.id);

    if (senderInfo) {
      const messageWithSender = {
        ...msg, // text, senderId, timestamp from client
        username: senderInfo.username, // Add the sender's username
      };

      socket.broadcast.emit("chat message", messageWithSender);
    }
  });

  // private messages
  socket.on("private message", ({ to, message }) => {
    const recipient = onlineUsers.get(to);

    // Always send to sender (so it appears in their chat)
    socket.emit("private message", {
      from: user.id,
      fromUsername: user.username,
      to,
      message,
      timestamp: new Date().toISOString(),
    });

    // If recipient is online, send to them
    if (recipient) {
      io.to(recipient.socketId).emit("private message", {
        from: user.id,
        fromUsername: user.username,
        to,
        message,
        timestamp: new Date().toISOString(),
      });
    }
    // If offline → you can save to DB later (optional)
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${user.username}`);

    onlineUsers.delete(user.id);
    io.emit("online users", Array.from(onlineUsers.values()));
  });
}

module.exports = socketHandlers;
