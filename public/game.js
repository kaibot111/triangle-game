const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { id: 'me', x: -50, y: canvas.height - 100, targetX: canvas.width / 2, speed: 0, lap: 0, progress: 0 };
let opponents = {}; // To store other players' progress
let gameStarted = false;
let gates = [];
let currentAns = null;
let isPenalty = false;
let scrollOffset = 0;
const TRACK_LENGTH = 12000; // Total distance for 3 laps

// Initialize Gates for 3 laps
for (let i = 1; i < 60; i++) {
    gates.push({ y: -i * 400, passed: false });
}

function drawMinimap() {
    const mapW = 40;
    const mapH = 300;
    const mapX = canvas.width - 60;
    const mapY = canvas.height / 2 - mapH / 2;

    // Minimap Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = "#00f2ff";
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // Progress = current scrollOffset / total track length
    let playerProgress = Math.min(scrollOffset / TRACK_LENGTH, 1);
    
    // Draw Player Dot
    ctx.fillStyle = "#00ffcc";
    ctx.beginPath();
    ctx.arc(mapX + mapW / 2, mapY + mapH - (playerProgress * mapH), 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Opponents (if multiplayer connected)
    Object.values(opponents).forEach(opp => {
        let oppProgress = Math.min(opp.scrollOffset / TRACK_LENGTH, 1);
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(mapX + mapW / 2, mapY + mapH - (oppProgress * mapH), 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function generateMath() {
    const mode = document.getElementById('mathMode').value;
    const hud = document.getElementById('hud');
    const q = document.getElementById('question');
    hud.style.display = 'block';
    document.getElementById('ans').focus();

    // Utah Core Standards: Geometry
    if (mode === 'Area') {
        let b = Math.floor(Math.random() * 10) + 2;
        let h = Math.floor(Math.random() * 8) + 2;
        let isTri = Math.random() > 0.5;
        q.innerText = isTri ? `Triangle: b=${b}, h=${h}. Area?` : `Parallelogram: b=${b}, h=${h}. Area?`;
        currentAns = isTri ? (0.5 * b * h) : (b * h);
        // 

[Image of the area of a triangle formula diagram]

    } else if (mode === 'TriangleInequality') {
        let a = Math.floor(Math.random() * 5) + 2;
        let b = Math.floor(Math.random() * 5) + 2;
        let c = Math.floor(Math.random() * 12) + 1;
        q.innerText = `Sides: ${a}, ${b}, ${c}. Triangle? (y/n)`;
        currentAns = (a + b > c && a + c > b && b + c > a) ? 'y' : 'n';
        // 
    } else {
        let a1 = Math.floor(Math.random() * 60) + 20;
        let a2 = Math.floor(Math.random() * 60) + 20;
        q.innerText = `Angles: ${a1}°, ${a2}°. 3rd angle?`;
        currentAns = 180 - a1 - a2;
        // 
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted && player.x < player.targetX) {
        player.x += 5;
    }

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset += player.speed;
        player.speed = isPenalty ? 1.5 : 6;
        
        // Multiplayer Sync
        socket.emit('updatePos', { room: window.roomCode, scrollOffset: scrollOffset });
    }

    // Draw Track & Gates
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        if (screenY > -100 && screenY < canvas.height + 100) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, screenY, 80, 0, Math.PI * 2);
            ctx.stroke();
            
            if (screenY > player.y && !gate.passed) {
                gate.passed = true;
                generateMath();
            }
        }
    });

    // Player Ship
    ctx.fillStyle = isPenalty ? "#ff4444" : "#00ffcc";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 20, player.y + 40);
    ctx.lineTo(player.x + 20, player.y + 40);
    ctx.fill();

    drawMinimap();
    requestAnimationFrame(update);
}

// Socket sync for Minimap
socket.on('opponentMove', (data) => {
    opponents[data.id] = { scrollOffset: data.scrollOffset };
});

// Answer Logic
document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isPenalty) {
        if (e.target.value.toLowerCase() == currentAns) {
            document.getElementById('hud').style.display = 'none';
            e.target.value = '';
        } else {
            isPenalty = true;
            document.getElementById('penalty-timer').style.display = 'block';
            setTimeout(() => {
                isPenalty = false;
                document.getElementById('penalty-timer').style.display = 'none';
            }, 3000);
        }
    }
});

window.startRace = () => { gameStarted = true; document.getElementById('start-btn').style.display = 'none'; };
update();
