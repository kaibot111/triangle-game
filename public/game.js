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

// --- TRACK GEOMETRY CONFIGURATION ---
// Large wave: The overall "winding" of the track
const baseAmplitude = 400; 
const baseFrequency = 0.0005; // Very slow, large turns

// Small wave: The "wiggles" between rings
const wiggleAmplitude = 150; 
const wiggleFrequency = 0.002; // Larger time between wiggles as requested

/**
 * The core wavefunction for the invisible track.
 * This is NOT random; it is a deterministic mathematical path.
 */
function getTrackY(x) {
    const centerY = 1000; // The vertical center of the world
    const baseWave = Math.sin(x * baseFrequency) * baseAmplitude;
    const wiggleWave = Math.sin(x * wiggleFrequency) * wiggleAmplitude;
    return centerY + baseWave + wiggleWave;
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Place Gates and Obstacles along the mathematical path
    for (let i = 1; i < 150; i++) {
        const xPos = i * 900; // Increased distance between rings for better flow
        const pathY = getTrackY(xPos);
        
        gates.push({ x: xPos, y: pathY, passed: false });
        
        // Place decorations relative to the track's current Y
        obstacles.push({ 
            x: xPos + Math.random() * 600, 
            y: pathY + (Math.random() - 0.5) * 1200,
            type: [imgPlanet, imgStar, imgAsteroid][Math.floor(Math.random() * 3)],
            size: 100 + Math.random() * 120
        });
    }
    requestAnimationFrame(update);
}

function update() {
    ctx.fillStyle = "#000010"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 12; // Smooth, fast racing speed
    }

    // 1. Position Player exactly on the Wavefunction
    const worldX = player.x - scrollOffset;
    player.y = getTrackY(worldX);

    // 2. Calculate Rotation based on the path's slope (look-ahead method)
    const lookAhead = 30;
    const nextY = getTrackY(worldX + lookAhead);
    player.rotation = Math.atan2(nextY - player.y, lookAhead);

    // 3. Smooth Camera Follow
    // Centers the ship vertically on the screen
    const cameraOffsetY = (canvas.height / 2) - player.y;

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Draw Obstacles
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -400 && screenX < canvas.width + 400) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // Draw Rings (The "Invisible" Path Markers)
    ctx.strokeStyle = "rgba(0, 242, 255, 0.4)";
    ctx.lineWidth = 12;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 110, 0, Math.PI * 2);
            ctx.stroke();

            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 4. Draw Spaceship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore(); // Exit camera space

    requestAnimationFrame(update);
}

// Math HUD Logic (Unchanged as requested)
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
