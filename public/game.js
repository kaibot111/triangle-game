import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 150, y: 0, speed: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

// Load your provided files
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height / 2;

    // Generate Space Environment
    for (let i = 1; i < 60; i++) {
        const xPos = i * 600;
        // Place a Math Gate
        gates.push({ x: xPos, y: canvas.height / 2 + Math.sin(i) * 200, passed: false });
        
        // Place decorative obstacles around the gates
        obstacles.push({ 
            x: xPos + Math.random() * 300, 
            y: Math.random() * canvas.height,
            type: [imgPlanet, imgStar, imgAsteroid][Math.floor(Math.random() * 3)],
            size: 40 + Math.random() * 60
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
    // 1. Space Background
    ctx.fillStyle = "#000015"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 6; // Move world to the left
    }

    // 2. Draw Start Line (on the left)
    drawCheckeredLine(player.x + scrollOffset - 80);

    // 3. Draw Obstacles (Planets, Stars, Asteroids)
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // 4. Draw Math Gates
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -100 && screenX < canvas.width + 100) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 70, 0, Math.PI * 2);
            ctx.stroke();

            // Collision logic
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 5. Draw Player (Pointed Right)
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 40, player.y - 20);
    ctx.lineTo(player.x - 40, player.y + 20);
    ctx.fill();

    requestAnimationFrame(update);
}

function showMath() {
    const randomIdx = Math.floor(Math.random() * questionBank.length);
    const selected = questionBank[randomIdx];
    document.getElementById('question').innerText = selected.q;
    currentAns = selected.a;
    document.getElementById('hud').style.display = 'block';
    document.getElementById('ans').value = '';
    document.getElementById('ans').focus();
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
