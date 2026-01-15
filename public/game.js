import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 30, y: 0, width: 70, height: 45, rotation: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;
let countdownValue = null;

// --- PHYSICS & ANIMATION STATES ---
let currentSpeed = 10;
let questionStartTime = 0;
let isCoolingDown = false;
let spinAngle = 0; // For the 360 spinout
let shakeAmount = 0; // For camera shake

// Assets
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';
const imgSaturn = new Image(); imgSaturn.src = './assets/saturn.png';
const imgBlackHole = new Image(); imgBlackHole.src = './assets/blackhole.png';
const imgStation = new Image(); imgStation.src = './assets/spacestation.png';

/**
 * Enhanced Path Function: 
 * Creates long straight sections (Right) followed by sharp curves (Up/Down)
 */
function getTrackY(x) {
    const centerY = 1200;
    // Create a "Step" function using sine waves that flatten out
    // This makes the ship fly straight for a while before turning
    const sectionWidth = 5000; 
    const isStraight = (x % sectionWidth) < (sectionWidth * 0.4);
    
    if (isStraight) {
        // Find the Y value at the start of the straight section to keep it level
        const startOfSection = Math.floor(x / sectionWidth) * sectionWidth;
        return centerY + Math.sin(startOfSection * 0.0004) * 500;
    } else {
        return centerY + Math.sin(x * 0.0004) * 500 + Math.sin(x * 0.002) * 150;
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = getTrackY(player.x);

    for (let i = 1; i <= 200; i++) {
        const xPos = i * 1100;
        const pathY = getTrackY(xPos);
        gates.push({ x: xPos, y: pathY, passed: false });
        
        let type = imgStar; let size = 40;
        if (i % 30 === 0) { type = imgSaturn; size = 500; }
        else if (i % 45 === 0) { type = imgBlackHole; size = 600; }
        
        obstacles.push({ x: xPos, y: pathY + (Math.random() - 0.5) * 1200, type: type, size: size });
    }
    requestAnimationFrame(update);
}

function update() {
    ctx.fillStyle = "#000008"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && countdownValue === "GO!" && !isCoolingDown) {
        scrollOffset -= currentSpeed; 
        
        const worldX = player.x - scrollOffset;
        player.y = getTrackY(worldX);

        const lookAhead = 50;
        const targetY = getTrackY(worldX + lookAhead);
        const targetRotation = Math.atan2(targetY - player.y, lookAhead);
        
        // Smooth alignment to path
        player.rotation += (targetRotation - player.rotation) * 0.1;
    }

    // Camera Shake Logic
    if (shakeAmount > 0) {
        ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
        shakeAmount *= 0.9; // Decay shake
    }

    const cameraOffsetY = (canvas.height / 2) - player.y;
    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Draw world (simplified for brevity, keeps your existing logic)
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -800 && screenX < canvas.width + 800) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -300 && screenX < canvas.width + 300) {
            ctx.strokeStyle = "rgba(0, 242, 255, 0.6)";
            ctx.lineWidth = 15;
            ctx.beginPath(); ctx.arc(screenX, gate.y, 120, 0, Math.PI * 2); ctx.stroke();
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // Draw Ship with Spinout Logic
    ctx.save();
    ctx.translate(player.x, player.y);
    // Add the spinAngle (360) to the current path rotation
    ctx.rotate(player.rotation + spinAngle);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore();

    // UI overlays (Countdown and Penalty)
    if (countdownValue !== null) {
        ctx.fillStyle = "white"; ctx.font = "bold 100px Arial"; ctx.textAlign = "center";
        ctx.fillText(countdownValue, canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(update);
}

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAns = e.target.value.toLowerCase().trim();
        if (userAns == currentAns) {
            const timeTaken = (Date.now() - questionStartTime) / 1000;
            currentSpeed = Math.max(8, 30 - (timeTaken * 4)); 
            document.getElementById('hud').style.display = 'none';
        } else {
            // --- SPINOUT AND SHAKE ON WRONG ANSWER ---
            currentSpeed = 2; // Near stop
            isCoolingDown = true;
            shakeAmount = 20; // Start camera shake
            
            // Animate 360 spin
            let start = null;
            function animateSpin(timestamp) {
                if (!start) start = timestamp;
                let progress = timestamp - start;
                spinAngle = (progress / 1000) * (Math.PI * 2); // Complete 360 in 1s
                if (progress < 1000) requestAnimationFrame(animateSpin);
                else spinAngle = 0;
            }
            requestAnimationFrame(animateSpin);

            setTimeout(() => {
                isCoolingDown = false;
                document.getElementById('hud').style.display = 'none';
            }, 3000);
        }
    }
});

// ... Keep existing startRace and showMath functions ...
window.startRace = () => {
    document.getElementById('start-btn').style.display = 'none';
    const sequence = ["3", "2", "1", "GO!"];
    sequence.forEach((val, index) => {
        setTimeout(() => {
            countdownValue = val;
            if (val === "GO!") {
                gameStarted = true;
                setTimeout(() => { countdownValue = null; }, 1000);
            }
        }, index * 1000);
    });
};

function showMath() {
    const randomIdx = Math.floor(Math.random() * questionBank.length);
    const selected = questionBank[randomIdx];
    document.getElementById('question').innerText = selected.q;
    currentAns = selected.a;
    document.getElementById('hud').style.display = 'block';
    const input = document.getElementById('ans');
    input.value = '';
    input.disabled = false;
    input.focus();
    questionStartTime = Date.now();
}

window.onload = init;
