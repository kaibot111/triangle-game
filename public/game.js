import { questionBank } from './questions.js';
const socket = io();

let currentProblem = null;
let startTime = 0;

function nextProblem() {
    const randIdx = Math.floor(Math.random() * questionBank.length);
    currentProblem = questionBank[randIdx];
    document.getElementById('question').innerText = currentProblem.q;
    document.getElementById('ans').value = '';
    startTime = Date.now();
}

// Answer Logic
document.getElementById('ans').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const timeTaken = (Date.now() - startTime) / 1000;
        const isCorrect = e.target.value.trim() === currentProblem.a;
        
        socket.emit('submitAnswer', { correct: isCorrect, timeTaken });
        nextProblem(); // Immediately refresh with a random problem
    }
});

// Finish Line Event
socket.on('raceFinished', () => {
    document.getElementById('hud').style.display = 'none';
    alert("FINISH LINE CROSSED!");
});

// Start initialization
socket.on('go', () => { 
    document.getElementById('hud').style.display = 'block';
    nextProblem(); 
});
