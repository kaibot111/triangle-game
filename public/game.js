const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 0, y: 0 };
let gates = [];
let currentAns = null;
let gameStarted = false; // The game starts paused

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    player.x = canvas.width / 2;
    // Position player slightly below the line's starting point
    player.y = canvas.height - 150;

    for (let i = 1; i < 11; i++) {
        gates.push({ y: -i * 800, passed: false });
    }

    requestAnimationFrame(update);
}

function drawCheckeredLine(y) {
    const squareSize = 40;
    const rows = 2;
    const columns = Math.ceil(canvas.width / squareSize);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(c * squareSize, y + (r * squareSize), squareSize, squareSize);
        }
    }
}

function update() {
    ctx.fillStyle = "#000033"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only move the world if the game has started AND math isn't showing
    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset += 5;
    }

    // Draw Starting Line (Fixed to the track)
    // We position it so the player starts just behind it
    drawCheckeredLine(player.y + scrollOffset - 10);

    // Draw Gates
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

    // Draw Player
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
    
    // Utah Core 7th Grade Standard: Finding Missing Angles
    // 
    let a1 = 60, a2 = 70;
    q.innerText = `Triangle Angles: 60°, 70°, ?°. Find missing angle:`;
    currentAns = 50;

    hud.style.display = 'block';
    input.value = '';
    input.focus();
}

// Global function for the HTML button
window.startRace = () => {
    gameStarted = true;
    document.getElementById('start-btn').style.display = 'none';
};

document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value == currentAns) {
            document.getElementById('hud').style.display = 'none';
        }
    }
});

window.onload = init;
