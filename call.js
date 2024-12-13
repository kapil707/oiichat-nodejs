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
    socket.on('request-call', ({ userA, userB }) => {
        console.log(`request-call from ${userA} to ${userB}`);
        if (users[userB]) {
            io.to(users[userB]).emit('incoming-call', { userA });
        } else {
            socket.emit('user-unavailable', { userB });
        }
    });

    socket.on('accept-call', ({ userA, userB,signal }) => {
        console.log(`accept-call-by-user from ${userA} to ${userB}`);
        if (users[userA]) {
            io.to(users[userA]).emit('accept-call-by-user', { userA,userB,signal});
        } else {
            socket.emit('user-unavailable', { userB });
        }
    });

    socket.on('call-candidate', ({ userA, userB,signal }) => {
        console.log(`call-candidate from ${userA} to ${userB}`);
    });

    // Handle signaling data
    // socket.on('signal', (data) => {
    //     const { userA,userB, signal } = data;
    //     console.log(`signal from ${userA} to ${userB}`);
    //     if (users[userB]) {
    //         io.to(users[userB]).emit('signal', { userA: userA,userB:userB, signal });
    //     }
    // });

    socket.on('signal', (data) => {
        const {your_id, target, signal } = data;
        if (users[target]) {
            console.log(`Signal from ${your_id} to ${target}`);
            io.to(users[target]).emit('signal', { signal, sender: users[your_id] });
        } else {
            console.log(`Target not found: ${target}`);
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
