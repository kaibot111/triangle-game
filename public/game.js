import { questionBank } from './questions.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scrollOffset = 0;
let player = { x: 0, y: 0 };
let gates = [];
let currentAns = null;
let gameStarted = false;

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 150;

    // Create 50 gates to cover a long race
    for (let i = 1; i < 51; i++) {
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

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        scrollOffset += 6;
    }

    drawCheckeredLine(player.y + scrollOffset - 10);

    ctx.strokeStyle = "magenta";
    ctx.lineWidth = 5;
    gates.forEach(gate => {
        let screenY = gate.y + scrollOffset;
        if (screenY > -100 && screenY < canvas.height + 100) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, screenY, 80, 0, Math.PI * 2);
            ctx.stroke();

            if (screenY > player.y && !gate.passed) {
                gate.passed = true;
                showMath();
            }
        }
    });

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
    const qElement = document.getElementById('question');
    const input = document.getElementById('ans');
    
    // Pick a random question from the bank
    const randomIdx = Math.floor(Math.random() * questionBank.length);
    const selected = questionBank[randomIdx];

    qElement.innerText = selected.q;
    currentAns = selected.a;

    hud.style.display = 'block';
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
