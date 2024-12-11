const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Map to store users and their socket IDs
const users = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user registration
    socket.on('register', (username) => {
        users[username] = socket.id;
        console.log(`${username} registered with socket ID ${socket.id}`);
    });

    // Handle call request
    socket.on('call-user', ({ from, to }) => {
        if (users[to]) {
            io.to(users[to]).emit('incoming-call', { from });
        } else {
            socket.emit('user-unavailable', { to });
        }
    });

    // Handle signaling data
    socket.on('signal', (data) => {
        const { to, signal } = data;
        if (users[to]) {
            io.to(users[to]).emit('signal', { from: socket.id, signal });
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const username = Object.keys(users).find(key => users[key] === socket.id);
        if (username) {
            delete users[username];
            console.log(`${username} disconnected`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
