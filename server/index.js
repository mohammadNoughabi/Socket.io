const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, "../client/index.html"));
});

io.on("connection", (socket) => {
  console.log(`User with socket id ${socket.id} conected`);

  socket.on("disconnect", () => {
    console.log(`User with socket id ${socket.id} disconected`);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

io.on("connection", (socket) => {
  // join the room named 'some room'
  socket.join("some room");

  // broadcast to all connected clients in the room
  io.to("some room").emit("hello", "world");

  // broadcast to all connected clients except those in the room
  io.except("some room").emit("hello", "world");

  // leave the room
  socket.leave("some room");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
