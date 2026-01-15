import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
// Player starts at 0 rotation (facing right)
let player = { x: 30, y: 0, width: 70, height: 45, rotation: 0 };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;
let countdownValue = null;

let currentSpeed = 10;
let questionStartTime = 0;
let isCoolingDown = false;

// Assets
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';
const imgSaturn = new Image(); imgSaturn.src = './assets/saturn.png';
const imgBlackHole = new Image(); imgBlackHole.src = './assets/blackhole.png';
const imgStation = new Image(); imgStation.src = './assets/spacestation.png';

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

function drawStartLine(xPos) {
    const squareSize = 40;
    const columns = 2; 
    const worldCenterY = 1200;
    for (let col = 0; col < columns; col++) {
        for (let row = -25; row < 25; row++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : "#000000";
            ctx.fillRect(xPos + (col * squareSize), worldCenterY + (row * squareSize), squareSize, squareSize);
        }
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
            obstacles.push({ x: xPos, y: pathY + (Math.random() - 0.5) * 1200, type: type, size: size });
        }
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

        // --- ANIMATED SLOW TURN LOGIC ---
        const lookAhead = 40;
        const targetY = getTrackY(worldX + lookAhead);
        const targetRotation = Math.atan2(targetY - player.y, lookAhead);
        
        // This line makes the rotation move 5% of the way to the target every frame
        // result: a smooth, slow turn animation
        player.rotation += (targetRotation - player.rotation) * 0.05;
    }

    const cameraOffsetY = (canvas.height / 2) - player.y;
    ctx.save();
    ctx.translate(0, cameraOffsetY);

    drawStartLine(100 + scrollOffset);

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

    // UI Overlays
    if (countdownValue !== null) {
        ctx.fillStyle = "white";
        ctx.font = "bold 100px Arial";
        ctx.textAlign = "center";
        ctx.fillText(countdownValue, canvas.width / 2, canvas.height / 2);
    }

    if (isCoolingDown) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SYSTEM REBOOTING... WAIT 3S", canvas.width / 2, canvas.height - 150);
    }

    requestAnimationFrame(update);
}

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
    
    // Update Drive System display
    document.getElementById('speed-display').innerText = "DRIVE SYSTEM: ENGAGED";
}

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAns = e.target.value.toLowerCase().trim();
        if (userAns == currentAns) {
            const timeTaken = (Date.now() - questionStartTime) / 1000;
            currentSpeed = Math.max(8, 30 - (timeTaken * 4)); 
            document.getElementById('hud').style.display = 'none';
            document.getElementById('speed-display').innerText = `DRIVE SYSTEM: ${Math.round(currentSpeed * 10)} km/h`;
        } else {
            currentSpeed = 5;
            isCoolingDown = true;
            e.target.disabled = true;
            document.getElementById('speed-display').innerText = "DRIVE SYSTEM: CRITICAL FAILURE";
            setTimeout(() => {
                isCoolingDown = false;
                document.getElementById('hud').style.display = 'none';
                document.getElementById('speed-display').innerText = "DRIVE SYSTEM: REBOOTED";
            }, 3000);
        }
    }
});

window.onload = init;
