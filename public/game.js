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

// --- SPEED & TRACK CONFIGURATION ---
const baseAmplitude = 450; 
const baseFrequency = 0.0004; 
const wiggleAmplitude = 180; 
const wiggleFrequency = 0.0015; // Slower wiggles for smoother high-speed flow
const raceSpeed = 18; // Increased from 12 to 18 to match the video's pace

function getTrackY(x) {
    const centerY = 1200; 
    const baseWave = Math.sin(x * baseFrequency) * baseAmplitude;
    const wiggleWave = Math.sin(x * wiggleFrequency) * wiggleAmplitude;
    return centerY + baseWave + wiggleWave;
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 1; i < 200; i++) {
        const xPos = i * 1100; // More distance between rings to account for higher speed
        const pathY = getTrackY(xPos);
        
        gates.push({ x: xPos, y: pathY, passed: false });
        
        // --- PLACE IDEAS HERE: OBSTACLE LOGIC ---
        // Logic for "Biomes" based on distance (i)
        let type = imgStar;
        let size = 40;

        if (i % 10 === 0) { // Every 10th gate, place a large planet
            type = imgPlanet;
            size = 300;
        } else if (i % 3 === 0) { // Every 3rd gate, an asteroid belt
            type = imgAsteroid;
            size = 80;
        }

        obstacles.push({ 
            x: xPos + Math.random() * 800, 
            y: pathY + (Math.random() - 0.5) * 1500,
            type: type,
            size: size + Math.random() * 50
        });
    }
    requestAnimationFrame(update);
}

function update() {
    ctx.fillStyle = "#000008"; // Darker space
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= raceSpeed; 
    }

    const worldX = player.x - scrollOffset;
    player.y = getTrackY(worldX);

    // Look-ahead for smooth rotation
    const lookAhead = 40;
    const nextY = getTrackY(worldX + lookAhead);
    player.rotation = Math.atan2(nextY - player.y, lookAhead);

    // Vertical Camera Follow (Snappier for high speed)
    const cameraOffsetY = (canvas.height / 2) - player.y;

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Render Obstacles
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -500 && screenX < canvas.width + 500) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // Render Math Rings
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

    // Render Ship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore();

    requestAnimationFrame(update);
}

// ... (showMath and startRace functions stay the same)
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
