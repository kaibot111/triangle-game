const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let serverState = { scrollOffset: 0, playerY: 0 };
let spinAngle = 0;

socket.on('stateUpdate', (state) => {
    serverState = state;
});

socket.on('spinout', () => {
    // Local visual-only animation for the 360 spin
    let start = Date.now();
    const anim = () => {
        let elapsed = Date.now() - start;
        spinAngle = (elapsed / 1000) * (Math.PI * 2);
        if (elapsed < 1000) requestAnimationFrame(anim);
        else spinAngle = 0;
    };
    anim();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cameraOffsetY = (canvas.height / 2) - serverState.playerY;
    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // Render logic is now purely visual based on serverState.scrollOffset
    // Draw Start Line, Obstacles, and Ship...
    ctx.save();
    ctx.translate(30, serverState.playerY);
    ctx.rotate(spinAngle); // Apply server-triggered spin
    ctx.drawImage(imgShip, -35, -22, 70, 45);
    ctx.restore();

    ctx.restore();
    requestAnimationFrame(draw);
}
draw();
