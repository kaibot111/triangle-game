const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 0, y: 0 };
let gates = [];
let currentAns = null;

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;

    for (let i = 1; i < 11; i++) {
        gates.push({ y: -i * 800, passed: false });
    }

    requestAnimationFrame(update);
}

// Helper to draw the checkered pattern
function drawCheckeredLine(y) {
    const squareSize = 40;
    const rows = 2;
    const columns = Math.ceil(canvas.width / squareSize);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // Alternate colors based on row and column index
            ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(c * squareSize, y + (r * squareSize), squareSize, squareSize);
        }
    }
}

function update() {
    // 1. Draw Background
    ctx.fillStyle = "#000033"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. World Movement
    if (document.getElementById('hud').style.display !== 'block') {
        scrollOffset += 5;
    }

    // 3. Draw Starting Line
    // This starts at the player's initial position and moves down
    drawCheckeredLine(player.y + scrollOffset - 50);

    // 4. Draw Gates
    ctx.strokeStyle = "magenta";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        
        ctx.beginPath();
        ctx.arc(canvas.width / 2, screenY, 80, 0, Math.PI * 2);
        ctx.stroke();

        if (screenY > player.y && !gate.passed) {
            gate.passed = true;
            showMath();
        }
    });

    // 5. Draw Player
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 20, player.y + 40);
    ctx.lineTo(player.x + 20, player.y + 40);
    ctx.fill();

    requestAnimationFrame(update);
}

function showMath() {
    const hud = document.getElementById('hud');
    const q = document.getElementById('question');
    const input = document.getElementById('ans');
    
    let b = 10, h = 6;
    q.innerText = `Triangle Area: b=10, h=6. Answer?`;
    currentAns = 30;

    hud.style.display = 'block';
    input.value = '';
    input.focus();
}

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value == currentAns) {
            document.getElementById('hud').style.display = 'none';
        }
    }
});

window.onload = init;
