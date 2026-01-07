const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Fix for Black Screen: Set size immediately
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let player = { x: -100, y: canvas.height - 150, targetX: canvas.width / 2, speed: 0 };
let opponents = {};
let gameStarted = false;
let gates = [];
let currentAns = null;
let isPenalty = false;
let scrollOffset = 0;
const TRACK_LENGTH = 15000;

// Stars for background
const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
}));

// Setup Gates
for (let i = 1; i < 50; i++) {
    gates.push({ y: -i * 500, passed: false });
}

function drawCheckeredLine(y) {
    const size = 30;
    for (let i = 0; i < canvas.width / size; i++) {
        ctx.fillStyle = (i % 2 === 0) ? "#fff" : "#333";
        ctx.fillRect(i * size, y, size, size / 2);
    }
}

function update() {
    // 1. Clear Screen
    ctx.fillStyle = "#000011"; // Deep space blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Stars
    ctx.fillStyle = "#fff";
    stars.forEach(s => {
        let sy = (s.y + scrollOffset * 0.5) % canvas.height;
        ctx.fillRect(s.x, sy, s.size, s.size);
    });

    // 3. Sliding Entry
    if (!gameStarted && player.x < player.targetX) {
        player.x += 4;
    }

    // 4. Movement Logic
    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        player.speed = isPenalty ? 1.5 : 6;
        scrollOffset += player.speed;
    }

    // 5. Draw Gates (Geometry Visuals)
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        if (screenY > -100 && screenY < canvas.height + 100) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, screenY, 100, 0, Math.PI * 2);
            ctx.stroke();
            
            // Text to help students find the gate
            ctx.fillStyle = "#ff00ff";
            ctx.font = "14px Arial";
            ctx.fillText("MATH GATE", canvas.width / 2 - 40, screenY - 110);

            if (screenY > player.y && !gate.passed) {
                gate.passed = true;
                window.generateMath();
            }
        }
    });

    // 6. Starting Line
    drawCheckeredLine(scrollOffset % (TRACK_LENGTH * 2));

    // 7. Player Ship
    ctx.fillStyle = isPenalty ? "#ff4444" : "#00ffcc";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f2ff";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 25, player.y + 50);
    ctx.lineTo(player.x + 25, player.y + 50);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // 8. Minimap
    drawMinimap();

    requestAnimationFrame(update);
}

function drawMinimap() {
    const mapW = 40, mapH = 200;
    const mapX = canvas.width - 60, mapY = 100;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = "#00f2ff";
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    let progress = (scrollOffset / TRACK_LENGTH) % 1;
    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(mapX + 5, mapY + mapH - (progress * mapH) - 5, mapW - 10, 5);
}

// Math logic must be global for buttons to see it
window.generateMath = () => {
    const mode = document.getElementById('mathMode').value;
    document.getElementById('hud').style.display = 'block';
    document.getElementById('ans').focus();

    if (mode === 'Area') {
        let b = 10, h = 5;
        document.getElementById('question').innerText = `Triangle: b=10, h=5. Area?`;
        currentAns = 25;
        // 

[Image of the area of a triangle formula diagram]

    } else if (mode === 'TriangleInequality') {
        document.getElementById('question').innerText = `Sides: 3, 4, 10. Triangle? (y/n)`;
        currentAns = "n";
        // 
    } else {
        document.getElementById('question').innerText = `Angles: 60, 60. Missing?`;
        currentAns = 60;
        // 
    }
};

window.startRace = () => { gameStarted = true; document.getElementById('start-btn').style.display = 'none'; };

// Launch
update();
