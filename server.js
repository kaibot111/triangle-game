const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) rooms[roomCode] = [];
        rooms[roomCode].push(socket.id);
        io.to(roomCode).emit('playerUpdate', rooms[roomCode]);
    });

    socket.on('updatePos', (data) => {
        socket.to(data.room).emit('opponentMove', { id: socket.id, pos: data.pos });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
