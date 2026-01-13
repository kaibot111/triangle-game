import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 150, y: 0, width: 70, height: 45, rotation: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';

// --- SHARPER WAVE SETTINGS ---
const waveAmplitude = 500; // Much higher peaks/valleys
const waveFrequency = 0.004; // Sharper, more frequent turns

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 1; i < 150; i++) {
        const xPos = i * 400; // Gates are closer together now
        const pathY = canvas.height / 2 + Math.sin(xPos * waveFrequency) * waveAmplitude;
        gates.push({ x: xPos, y: pathY, passed: false });
        
        obstacles.push({ 
            x: xPos + Math.random() * 400, 
            y: pathY + (Math.random() - 0.5) * 600, // Obstacles follow the general path
            type: [imgPlanet, imgStar, imgAsteroid][Math.floor(Math.random() * 3)],
            size: 60 + Math.random() * 80
        });
    }
    requestAnimationFrame(update);
}

function update() {
    ctx.fillStyle = "#000010"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 8; // Slightly faster speed for sharper waves
    }

    // 1. Calculate Ship Y Position and Rotation
    const worldX = player.x - scrollOffset;
    player.y = canvas.height / 2 + Math.sin(worldX * waveFrequency) * waveAmplitude;
    
    // Derivative for rotation
    const slope = (waveAmplitude * waveFrequency) * Math.cos(worldX * waveFrequency);
    player.rotation = Math.atan(slope);

    // 2. Camera Logic (Vertical Follow)
    // We shift the entire world so the player.y is always in the center of the screen
    const cameraOffsetY = (canvas.height / 2) - player.y;

    ctx.save();
    ctx.translate(0, cameraOffsetY); // Apply vertical camera follow

    // 3. Draw Assets (Inside Camera Space)
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // 4. Draw Rings
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 8;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -150 && screenX < canvas.width + 150) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 90, 0, Math.PI * 2);
            ctx.stroke();
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 5. Draw Rotating Spaceship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore(); // End Camera Space

    requestAnimationFrame(update);
}

// ... showMath and startRace functions remain the same
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
