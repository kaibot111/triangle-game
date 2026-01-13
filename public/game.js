import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 150, y: 0, width: 70, height: 45, rotation: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

// Asset Loading
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';

// Track Settings (Matches the "Wavefunction")
const waveAmplitude = 200; 
const waveFrequency = 0.002; 

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height / 2;

    for (let i = 1; i < 100; i++) {
        const xPos = i * 600;
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

function update() {
    ctx.fillStyle = "#000010"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 6; 
    }

    // 1. Calculate Ship Y Position (The Wavefunction)
    const worldX = player.x - scrollOffset;
    player.y = canvas.height / 2 + Math.sin(worldX * waveFrequency) * waveAmplitude;

    // 2. Calculate Ship Rotation (The Derivative/Slope)
    // Slope of sin(ax) is a*cos(ax)
    const slope = (waveAmplitude * waveFrequency) * Math.cos(worldX * waveFrequency);
    player.rotation = Math.atan(slope);

    // 3. Draw Assets
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // 4. Draw Rings
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 6;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -150 && screenX < canvas.width + 150) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 80, 0, Math.PI * 2);
            ctx.stroke();
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 5. Draw Rotating Spaceship
    ctx.save(); // Save current state
    ctx.translate(player.x, player.y); // Move origin to ship center
    ctx.rotate(player.rotation); // Rotate based on the wave slope
    ctx.drawImage(
        imgShip, 
        -player.width / 2, 
        -player.height / 2, 
        player.width, 
        player.height
    );
    ctx.restore(); // Restore state for next frame

    requestAnimationFrame(update);
}

// ... (showMath and StartRace functions remain the same)
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
