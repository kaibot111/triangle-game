const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: -50, y: canvas.height - 100, targetX: canvas.width / 2, speed: 0, lap: 0 };
let gameStarted = false;
let gates = [];
let currentAns = null;
let isPenalty = false;
let scrollOffset = 0;

// Initialize Gates
for (let i = 1; i < 20; i++) {
    gates.push({ y: -i * 600, passed: false });
}

function drawCheckeredLine(y) {
    const size = 20;
    for (let i = 0; i < canvas.width / size; i++) {
        ctx.fillStyle = (i % 2 === 0) ? "#fff" : "#000";
        ctx.fillRect(i * size, y, size, size);
    }
}

function generateMath() {
    const mode = document.getElementById('mathMode').value;
    const hud = document.getElementById('hud');
    const q = document.getElementById('question');
    hud.style.display = 'block';
    document.getElementById('ans').focus();

    if (mode === 'Area') {
        let b = Math.floor(Math.random() * 10) + 2, h = Math.floor(Math.random() * 10) + 2;
        let isTri = Math.random() > 0.5;
        q.innerText = isTri ? `Triangle Area: b=${b}, h=${h}` : `Parallelogram Area: b=${b}, h=${h}`;
        currentAns = isTri ? (0.5 * b * h) : (b * h);
    } else if (mode === 'TriangleInequality') {
        let a = 5, b = 8, c = Math.floor(Math.random() * 15) + 1;
        q.innerText = `Sides: ${a}, ${b}, ${c}. Triangle? (y/n)`;
        currentAns = (a + b > c && a + c > b && b + c > a) ? 'y' : 'n';
    } else {
        let a1 = 50, a2 = 60;
        q.innerText = `Angles: ${a1}°, ${a2}°. Third Angle?`;
        currentAns = 180 - a1 - a2;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Sliding Entry
    if (!gameStarted && player.x < player.targetX) {
        player.x += 5;
    }

    // 2. Scrolling & Movement
    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset += player.speed;
        player.speed = isPenalty ? 1 : 5;
    }

    // 3. Draw Track & Gates
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        if (screenY > 0 && screenY < canvas.height) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, screenY, 100, 0, Math.PI * 2);
            ctx.stroke();
            
            // Collision Detection
            if (screenY > player.y && !gate.passed) {
                gate.passed = true;
                generateMath();
            }
        }
    });

    // 4. Starting Line
    drawCheckeredLine(0 + scrollOffset);

    // 5. Player Ship (Triangle)
    ctx.fillStyle = "#00ffcc";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 15, player.y + 40);
    ctx.lineTo(player.x + 15, player.y + 40);
    ctx.fill();

    requestAnimationFrame(update);
}

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
