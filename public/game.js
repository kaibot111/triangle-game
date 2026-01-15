import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 30, y: 0, width: 70, height: 45, rotation: Math.PI };
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;
let countdownValue = null;

// --- DYNAMIC SPEED & PENALTY LOGIC ---
let currentSpeed = 10; // Base speed
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
        const nextY = getTrackY(worldX + 40);
        player.rotation = Math.atan2(nextY - player.y, 40);
    }

    const cameraOffsetY = (canvas.height / 2) - player.y;
    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Draw world elements (Start line, obstacles, gates)
    // ... (Same drawing logic as before)
    
    // Draw Ship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore();

    // HUD overlays
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
    questionStartTime = Date.now(); // Start timing the answer
}

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAns = e.target.value.toLowerCase().trim();
        
        if (userAns == currentAns) {
            // SUCCESS: Faster answer = Higher Speed
            const timeTaken = (Date.now() - questionStartTime) / 1000;
            // Average is 3s. If < 3s, speed increases. If > 3s, speed is slower.
            currentSpeed = Math.max(5, 30 - (timeTaken * 4)); 
            
            document.getElementById('hud').style.display = 'none';
        } else {
            // FAILURE: Slow down and 3-second penalty
            currentSpeed = 5;
            isCoolingDown = true;
            e.target.disabled = true;
            
            setTimeout(() => {
                isCoolingDown = false;
                document.getElementById('hud').style.display = 'none';
            }, 3000);
        }
    }
});

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

window.onload = init;
