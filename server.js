const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin for simplicity
    methods: ["GET", "POST"],
  },
});

const users = {}; // Map of userId -> socketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId}`);
  });

  // Handle call initiation
  socket.on("call", ({ from, to }) => {
    const calleeSocket = users[to];
    if (calleeSocket) {
      io.to(calleeSocket).emit("incomingCall", { from });
    }
  });

  // Handle offer
  socket.on("offer", ({ to, sdp }) => {
    const calleeSocket = users[to];
    if (calleeSocket) {
      io.to(calleeSocket).emit("offer", { from: socket.id, sdp });
    }
  });

  // Handle answer
  socket.on("answer", ({ to, sdp }) => {
    const callerSocket = users[to];
    if (callerSocket) {
      io.to(callerSocket).emit("answer", { sdp });
    }
  });

  // Handle ICE candidates
  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", { candidate });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Signaling server is running on port 3000");
});
