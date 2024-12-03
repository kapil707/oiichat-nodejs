const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store connected users
const users = {};

// Serve a basic HTML page for testing (optional)
app.get('/', (req, res) => {
    res.send('<h1>WebRTC Signaling Server</h1>');
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add the user to the list
    users[socket.id] = socket.id;

    // Notify other users about the new connection
    socket.broadcast.emit('user-connected', socket.id);

    // Handle signaling data
    socket.on('signal', (data) => {
        const { target, signal } = data;
        if (target && users[target]) {
            console.log(`Signal from ${socket.id} to ${target}`);
            io.to(target).emit('signal', { signal, sender: socket.id });
        } else {
            console.log(`Target not found: ${target}`);
        }
    });

    // Remove the user when they disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

// Start the server
const PORT = 3100;
server.listen(PORT, () => {
    console.log(`Signaling server is running on http://localhost:${PORT}`);
});
