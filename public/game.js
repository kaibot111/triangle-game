import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, gameStarted = false;
let opponents = {}, gates = [], currentAns = null;
let isPenalty = false, moveSpeed = 0.25;
const socket = io();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 1. Create Checkered Starting Line
    const loader = new THREE.TextureLoader();
    const checkerTex = loader.load('https://threejs.org/examples/textures/checker.png');
    checkerTex.wrapS = checkerTex.wrapT = THREE.RepeatWrapping;
    checkerTex.repeat.set(4, 1);
    const startLine = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 4),
        new THREE.MeshBasicMaterial({ map: checkerTex })
    );
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.z = 0;
    scene.add(startLine);

    // 2. Setup Player Ship (Starts off-screen left)
    const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
    ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial({ color: 0x00ffcc }));
    ship.position.set(-20, 0, 0); // Start at the left
    ship.rotation.x = Math.PI/2;
    scene.add(ship);

    // Lighting & Environment
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);

    // Build Track
    for(let i=1; i<100; i++) {
        const gate = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1, 8, 20), new THREE.MeshBasicMaterial({color: 0xff00ff}));
        gate.position.set(Math.sin(i * 0.5) * 5, 0, -i * 25);
        scene.add(gate);
        gates.push(gate);
    }

    animate();
}

window.startRace = () => {
    gameStarted = true;
    document.getElementById('start-btn').style.display = 'none';
};

function animate() {
    requestAnimationFrame(animate);

    // Entry Animation (Slide from left)
    if (ship.position.x < 0 && !gameStarted) {
        ship.position.x += 0.15;
    }

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        ship.position.z -= moveSpeed;
        ship.position.x = Math.sin(ship.position.z * 0.02) * 5;
        
        // Sync with server
        socket.emit('updatePos', { room: window.roomCode, pos: ship.position });
    }

    // Gate Collision
    gates.forEach(g => {
        if (Math.abs(ship.position.z - g.position.z) < 0.5 && !g.passed) {
            g.passed = true;
            window.generateMath();
        }
    });

    camera.position.set(ship.position.x, 3, ship.position.z + 8);
    camera.lookAt(ship.position);
    renderer.render(scene, camera);
}

// Math Penalty Logic
document.getElementById('ans').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isPenalty) {
        if (e.target.value == currentAns) {
            document.getElementById('hud').style.display = 'none';
            moveSpeed = 0.25; // Normal speed
            e.target.value = '';
        } else {
            // WRONG ANSWER PENALTY
            isPenalty = true;
            moveSpeed = 0.05; // Slow down
            document.getElementById('penalty-timer').style.display = 'block';
            setTimeout(() => {
                isPenalty = false;
                document.getElementById('penalty-timer').style.display = 'none';
            }, 3000);
        }
    }
});

// Logic for seeing other ships (Simplified for prompt)
socket.on('opponentMove', (data) => {
    if (!opponents[data.id]) {
        opponents[data.id] = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 8), new THREE.MeshBasicMaterial({color: 0xff4444}));
        opponents[data.id].rotation.x = Math.PI/2;
        scene.add(opponents[data.id]);
    }
    opponents[data.id].position.copy(data.pos);
});

init();
