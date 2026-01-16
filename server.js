const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const FINISH_LINE_X = 324000; // Fixed distance (approx 5 mins at 18px/frame)

let gameState = {
    scrollOffset: 0,
    currentSpeed: 10,
    gameStarted: false,
    isFinished: false
};

setInterval(() => {
    if (gameState.gameStarted && !gameState.isFinished) {
        gameState.scrollOffset -= gameState.currentSpeed;

        // Check for Fixed End Line
        if (Math.abs(gameState.scrollOffset) >= FINISH_LINE_X) {
            gameState.isFinished = true;
            io.emit('raceFinished');
        }

        io.emit('stateUpdate', {
            scrollOffset: gameState.scrollOffset,
            currentSpeed: gameState.currentSpeed,
            distanceLeft: FINISH_LINE_X - Math.abs(gameState.scrollOffset)
        });
    }
}, 1000 / 60);

io.on('connection', (socket) => {
    socket.on('submitAnswer', (data) => {
        if (data.correct) {
            // Faster answer = Faster Ship
            gameState.currentSpeed = Math.max(8, 40 - (data.timeTaken * 5));
        } else {
            // Penalty: Slowdown + Trigger Spinout
            gameState.currentSpeed = 3;
            io.emit('spinout');
        }
    });
});

http.listen(3000);
