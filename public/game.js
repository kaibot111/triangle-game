import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 200, y: 0, width: 60, height: 40, rotation: 0 };
let trackPoints = []; // The invisible path coordinates
let obstacles = [];
let gates = [];
let currentAns = null;
let gameStarted = false;

// Assets
const imgShip = new Image(); imgShip.src = './assets/spaceship.png';
const imgPlanet = new Image(); imgPlanet.src = './assets/planet.png';
const imgStar = new Image(); imgStar.src = './assets/star.png';
const imgAsteroid = new Image(); imgAsteroid.src = './assets/asteroid.png';

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 1. Generate the Invisible Track
    // We create a point every 50 pixels to ensure smooth movement
    let currentY = canvas.height / 2;
    for (let x = 0; x < 100000; x += 50) {
        // Random walk logic to create a winding "video-style" track
        currentY += (Math.random() - 0.5) * 300; 
        // Keep track within reasonable vertical bounds
        currentY = Math.max(200, Math.min(2000, currentY));
        trackPoints.push({ x, y: currentY });
    }

    // 2. Place Gates and Obstacles along that track
    for (let i = 1; i < 100; i++) {
        const xPos = i * 800;
        const p = getTrackPoint(xPos);
        
        gates.push({ x: xPos, y: p.y, passed: false });
        
        obstacles.push({ 
            x: xPos + Math.random() * 500, 
            y: p.y + (Math.random() - 0.5) * 800,
            type: [imgPlanet, imgStar, imgAsteroid][Math.floor(Math.random() * 3)],
            size: 80 + Math.random() * 100
        });
    }
    requestAnimationFrame(update);
}

// Helper: Find the Y coordinate of the track at any X position
function getTrackPoint(x) {
    const index = Math.floor(x / 50);
    if (index >= trackPoints.length - 1) return trackPoints[trackPoints.length - 1];
    
    // Linear Interpolation for perfectly smooth movement between points
    const p1 = trackPoints[index];
    const p2 = trackPoints[index + 1];
    const t = (x % 50) / 50;
    return {
        x: x,
        y: p1.y + (p2.y - p1.y) * t
    };
}

function update() {
    ctx.fillStyle = "#000015"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset -= 10; // Speed matching the video's pace
    }

    // 3. Position Player on the Track
    const worldX = player.x - scrollOffset;
    const currentPoint = getTrackPoint(worldX);
    const nextPoint = getTrackPoint(worldX + 20); // Look ahead for rotation
    
    player.y = currentPoint.y;
    player.rotation = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x);

    // 4. Camera Follow
    const cameraOffsetY = (canvas.height * 0.6) - player.y;

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Draw Environment
    obstacles.forEach(obs => {
        let screenX = obs.x + scrollOffset;
        if (screenX > -300 && screenX < canvas.width + 300) {
            ctx.drawImage(obs.type, screenX, obs.y, obs.size, obs.size);
        }
    });

    // Draw Gates
    ctx.strokeStyle = "rgba(0, 242, 255, 0.5)";
    ctx.lineWidth = 10;
    gates.forEach(gate => {
        let screenX = gate.x + scrollOffset;
        if (screenX > -200 && screenX < canvas.width + 200) {
            ctx.beginPath();
            ctx.arc(screenX, gate.y, 100, 0, Math.PI * 2);
            ctx.stroke();
            if (screenX < player.x && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

    // 5. Draw Ship
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(imgShip, -player.width/2, -player.height/2, player.width, player.height);
    ctx.restore();

    ctx.restore(); // End Camera

    // 6. Draw Minimap (Bottom Right)
    drawMinimap();

    requestAnimationFrame(update);
}

function drawMinimap() {
    const mapW = 150, mapH = 60;
    const mapX = canvas.width - 170, mapY = canvas.height - 80;
    ctx.strokeStyle = "white";
    ctx.strokeRect(mapX, mapY, mapW, mapH);
    
    ctx.beginPath();
    ctx.strokeStyle = "cyan";
    for(let i=0; i<mapW; i++) {
        let tx = ((-scrollOffset / 50) + (i * 5)) % trackPoints.length;
        let ty = trackPoints[Math.floor(tx)].y / 30; // Scale down
        if(i===0) ctx.moveTo(mapX + i, mapY + 30 + ty);
        else ctx.lineTo(mapX + i, mapY + 10 + (trackPoints[Math.floor(tx)].y / 40));
    }
    ctx.stroke();
}

// ... (showMath and StartRace remain unchanged)
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
