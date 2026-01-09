const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 0, y: 0 };
let gates = [];
let currentAns = null;

function init() {
    // Set Canvas Size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;

    // Create 10 basic gates
    for (let i = 1; i < 11; i++) {
        gates.push({ y: -i * 800, passed: false });
    }

    requestAnimationFrame(update);
}

function update() {
    // 1. Draw Background
    ctx.fillStyle = "#000022"; // Deep Blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Move World (Automatic racing)
    if (document.getElementById('hud').style.display !== 'block') {
        scrollOffset += 5;
    }

    // 3. Draw Gates
    ctx.strokeStyle = "magenta";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        
        // Draw Gate Circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, screenY, 80, 0, Math.PI * 2);
        ctx.stroke();

        // Check Collision
        if (screenY > player.y && !gate.passed) {
            gate.passed = true;
            showMath();
        }
    });

    // 4. Draw Player (Simple Triangle)
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
    
    // Simple 7th Grade Geometry (Area)
    // 
    let b = 10, h = 6;
    q.innerText = `Triangle Area: b=10, h=6. Answer?`;
    currentAns = 30;

    hud.style.display = 'block';
    input.value = '';
    input.focus();
}

// Answer Check
document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value == currentAns) {
            document.getElementById('hud').style.display = 'none';
        }
    }
});

// Start the game loop on page load
window.onload = init;
