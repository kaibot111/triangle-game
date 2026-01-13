import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 250, y: 0, width: 70, height: 45, rotation: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

// Assets
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';
const imgSaturn = new Image(); imgSaturn.src = './assets/saturn.png';
const imgBlackHole = new Image(); imgBlackHole.src = './assets/blackhole.png';
const imgStation = new Image(); imgStation.src = './assets/spacestation.png';

const raceSpeed = 18; 
const baseAmplitude = 450; 
const baseFrequency = 0.0004; 
const wiggleAmplitude = 180; 
const wiggleFrequency = 0.0015; 

function getTrackY(x) {
    const centerY = 1200; 
    const baseWave = Math.sin(x * baseFrequency) * baseAmplitude;
    const wiggleWave = Math.sin(x * wiggleFrequency) * wiggleAmplitude;
    return centerY + baseWave + wiggleWave;
}

// --- NEW: FUNCTION TO DRAW CHECKERED START LINE ---
function drawStartLine(xPos) {
    const squareSize = 40;
    const columns = 2; // Two rows of checkers
    const worldCenterY = 1200;
    const lineSpan = 2000; // How far up and down the line goes

    for (let col = 0; col < columns; col++) {
        for (let row = -25; row < 25; row++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : "#000000";
            ctx.fillRect(
                xPos + (col * squareSize), 
                worldCenterY + (row * squareSize), 
                squareSize, 
                squareSize
            );
        }
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 1; i <= 200; i++) {
        const xPos = i * 1100;
        const pathY = getTrackY(xPos);
        gates.push({ x: xPos, y: pathY, passed: false });
        
        let type = null;
        let size = 100;

        if (i === 30) { type = imgSaturn; size = 500; }
        else if (i === 60) { type = imgBlackHole; size = 600; }
        else if (i === 90) { type = imgStation; size = 400; }
        else {
            const rand = Math.random();
            if (rand < 0.05) { type = imgPlanet; size = 250; }
            else if (rand < 0.2) { type = imgAsteroid; size = 80; }
            else { type = imgStar; size = 40; }
        }

        if (type) {
            obstacles.push({ 
                x: xPos + (Math.random() * 400), 
                y: pathY + (Math.random() - 0.5) * 1200,
                type: type,
                size: size + Math.random() * 50
            });
        }
    }
    requestAnimationFrame(update);
}

function update() {
    ctx.fillStyle = "#000008"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= raceSpeed; 
    }

    const worldX = player.x - scrollOffset;
    player.y = getTrackY(worldX);

    const lookAhead = 40;
    const nextY = getTrackY(worldX + lookAhead);
    player.rotation = Math.atan2(nextY - player.y, lookAhead);

    const cameraOffsetY = (canvas.height / 2) - player.y;

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // --- DRAW THE START LINE AT X = 100 ---
    drawStartLine(100 + scrollOffset);

    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -800 && screenX < canvas.width + 800) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    ctx.strokeStyle = "rgba(0, 242, 255, 0.6)";
    ctx.lineWidth = 15;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -300 && screenX < canvas.width + 300) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 120, 0, Math.PI * 2);
            ctx.stroke();
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore();
    requestAnimationFrame(update);
}

function showMath() {
    const randomIdx = Math.floor(Math.random() * questionBank.length);
    const selected = questionBank[randomIdx];
    document.getElementById('question').innerText = selected.q;
    currentAns = selected.a;
    document.getElementById('hud').style.display = 'block';
    const input = document.getElementById('ans');
    input.value = '';
    input.focus();
}

window.startRace = () => {
    gameStarted = true;
    document.getElementById('start-btn').style.display = 'none';
};

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value.toLowerCase().trim() == currentAns) {
            document.getElementById('hud').style.display = 'none';
        }
    }
});

window.onload = init;
