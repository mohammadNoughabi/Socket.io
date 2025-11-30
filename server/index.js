const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, "../client/index.html"));
});

io.on("connection", (socket) => {
  console.log(`User with socket id ${socket.id} conected`);

  socket.on("disconnect", () => {
    console.log(`User with socket id ${socket.id} disconected`);
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg);
  });
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
