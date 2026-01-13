import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 150, y: 0, width: 60, height: 40 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

// Asset Loading
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';

// Track Settings
const waveAmplitude = 200; // How high/low the path goes
const waveFrequency = 0.002; // How tight the turns are

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height / 2;

    // Generate Environment & Gates
    for (let i = 1; i < 100; i++) {
        const xPos = i * 600;
        // The path formula: Center of screen + Sine wave based on X position
        const pathY = canvas.height / 2 + Math.sin(xPos * waveFrequency) * waveAmplitude;
        
        gates.push({ x: xPos, y: pathY, passed: false });
        
        obstacles.push({ 
            x: xPos + Math.random() * 400, 
            y: (Math.random() * canvas.height),
            type: [imgPlanet, imgStar, imgAsteroid][Math.floor(Math.random() * 3)],
            size: 50 + Math.random() * 50
        });
    }
    requestAnimationFrame(update);
}

function drawCheckeredLine(x) {
    const squareSize = 40;
    for (let r = 0; r < Math.ceil(canvas.height / squareSize); r++) {
        for (let c = 0; c < 2; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(x + (c * squareSize), r * squareSize, squareSize, squareSize);
        }
    }
}

function update() {
    // 1. Render Background
    ctx.fillStyle = "#000010"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 6; 
    }

    // 2. Calculate Ship Path
    // The ship follows the same Sine wave as the gates based on its relative "world" X position
    const worldX = player.x - scrollOffset;
    player.y = canvas.height / 2 + Math.sin(worldX * waveFrequency) * waveAmplitude;

    // 3. Draw Start Line
    drawCheckeredLine(player.x + scrollOffset - 100);

    // 4. Draw Obstacles
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // 5. Draw Gates (Rings)
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 6;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -150 && screenX < canvas.width + 150) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 80, 0, Math.PI * 2);
            ctx.stroke();

            // Logic: If the ring passes the ship's nose, trigger math
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 6. Draw Spaceship Image
    // Centering the image on the calculated Y coordinate
    ctx.drawImage(
        imgShip, 
        player.x - (player.width / 2), 
        player.y - (player.height / 2), 
        player.width, 
        player.height
    );

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
