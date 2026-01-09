import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

// 1. Core Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let player = { x: 0, y: 0, targetX: 0, speed: 0 };
let gameStarted = false;
let scrollOffset = 0;
let gates = [];
let currentAns = null;
let isPenalty = false;

// 2. Initialization Function
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    player.x = -100; // Start off-screen for slide-in
    player.y = canvas.height - 150;
    player.targetX = canvas.width / 2;

    // Create 50 Math Gates
    for (let i = 1; i < 50; i++) {
        gates.push({ y: -i * 600, passed: false });
    }

    console.log("Canvas initialized: ", canvas.width, "x", canvas.height);
    requestAnimationFrame(update);
}

// 3. Main Game Loop
function update() {
    // Fill Background (Dark Space Blue)
    ctx.fillStyle = "#000015";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Decorative Stars
    ctx.fillStyle = "#ffffff";
    for(let i=0; i<50; i++) {
        let starY = (i * 137 + scrollOffset * 0.2) % canvas.height;
        ctx.fillRect((i * 231) % canvas.width, starY, 2, 2);
    }

    // Slide-in Animation
    if (!gameStarted && player.x < player.targetX) {
        player.x += 5;
    }

    // Racing Logic
    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        player.speed = isPenalty ? 1.5 : 7;
        scrollOffset += player.speed;
    }

    // Draw Math Gates
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        if (screenY > -100 && screenY < canvas.height + 100) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, screenY, 100, 0, Math.PI * 2);
            ctx.stroke();

            // Collision Detection
            if (screenY > player.y && !gate.passed) {
                gate.passed = true;
                window.generateMath();
            }
        }
    });

    // Draw Ship
    ctx.fillStyle = isPenalty ? "#ff4444" : "#00f2ff";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 25, player.y + 50);
    ctx.lineTo(player.x + 25, player.y + 50);
    ctx.fill();

    // Draw Minimap
    drawMinimap();

    requestAnimationFrame(update);
}

function drawMinimap() {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(canvas.width - 50, 100, 30, 200);
    ctx.fillStyle = "#00f2ff";
    let progress = (scrollOffset / 30000) % 1;
    ctx.fillRect(canvas.width - 45, 300 - (progress * 200), 20, 5);
}

// 4. Global Math Functions
window.generateMath = () => {
    const mode = document.getElementById('mathMode').value;
    document.getElementById('hud').style.display = 'block';
    document.getElementById('ans').focus();

    if (mode === 'Area') {
        let b = 8, h = 4;
        document.getElementById('question').innerText = `Triangle: b=8, h=4. Area?`;
        currentAns = 16;
        // 

[Image of the area of a triangle formula diagram]

    } else if (mode === 'TriangleInequality') {
        document.getElementById('question').innerText = `Sides: 2, 2, 10. Triangle? (y/n)`;
        currentAns = "n";
        // 
    } else {
        document.getElementById('question').innerText = `Angles: 45, 45. Missing?`;
        currentAns = 90;
        // 

[Image of a triangle with interior angles summing to 180 degrees]

    }
};

window.startRace = () => {
    gameStarted = true;
    document.getElementById('start-btn').style.display = 'none';
};

// 5. Start the Engine
window.addEventListener('load', init);
