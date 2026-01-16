const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// --- SERVER-SIDE GAME STATE ---
let gameState = {
    scrollOffset: 0,
    currentSpeed: 10,
    isCoolingDown: false,
    gameStarted: false,
    countdown: null
};

const TRACK_CONFIG = {
    baseAmp: 450, baseFreq: 0.0004,
    wiggleAmp: 180, wiggleFreq: 0.0015,
    sectionWidth: 5000
};

// Deterministic Path Calculation
function getTrackY(x) {
    const centerY = 1200;
    const isStraight = (x % TRACK_CONFIG.sectionWidth) < (TRACK_CONFIG.sectionWidth * 0.4);
    if (isStraight) {
        const startOfSection = Math.floor(x / TRACK_CONFIG.sectionWidth) * TRACK_CONFIG.sectionWidth;
        return centerY + Math.sin(startOfSection * TRACK_CONFIG.baseFreq) * TRACK_CONFIG.baseAmp;
    }
    return centerY + Math.sin(x * TRACK_CONFIG.baseFreq) * TRACK_CONFIG.baseAmp + Math.sin(x * TRACK_CONFIG.wiggleFreq) * TRACK_CONFIG.wiggleAmp;
}

// Physics Loop (60 TPS)
setInterval(() => {
    if (gameState.gameStarted && !gameState.isCoolingDown) {
        gameState.scrollOffset -= gameState.currentSpeed;
        
        // Broadcast state to client
        io.emit('stateUpdate', {
            scrollOffset: gameState.scrollOffset,
            currentSpeed: gameState.currentSpeed,
            playerY: getTrackY(30 - gameState.scrollOffset),
            isCoolingDown: gameState.isCoolingDown
        });
    }
}, 1000 / 60);

io.on('connection', (socket) => {
    socket.on('startMission', () => {
        // Handle countdown and start on server
        let count = 3;
        const timer = setInterval(() => {
            io.emit('countdown', count > 0 ? count : "GO!");
            if (count === -1) {
                gameState.gameStarted = true;
                clearInterval(timer);
            }
            count--;
        }, 1000);
    });

    socket.on('submitAnswer', (data) => {
        // Logic for speed increase or spinout penalty
        if (data.correct) {
            gameState.currentSpeed = Math.min(30, gameState.currentSpeed + 5);
        } else {
            gameState.currentSpeed = 2;
            gameState.isCoolingDown = true;
            io.emit('spinout');
            setTimeout(() => { gameState.isCoolingDown = false; }, 3000);
        }
    });
});

http.listen(3000, () => console.log('Server running on port 3000'));
