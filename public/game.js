import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, gameStarted = false;
let opponents = {}, gates = [], currentAns = null;
let isPenalty = false, moveSpeed = 0.3, baseSpeed = 0.3;
let lapsCompleted = 0;
const TOTAL_LAPS = 3;
const socket = io();

// UI References
const hud = document.getElementById('hud');
const questionEl = document.getElementById('question');
const ansInput = document.getElementById('ans');
const penaltyTimerEl = document.getElementById('penalty-timer');
const notificationEl = document.getElementById('notification');

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000008);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // 1. Checkered Starting Line
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

        // 2. Player Ship (Starts at x: -15 for sliding animation)
        const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
        ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial({ color: 0x00ffcc }));
        ship.position.set(-15, 0, 0); 
        ship.rotation.x = Math.PI/2;
        scene.add(ship);

        // 3. Track Generation
        for(let i=1; i<40; i++) {
            const gateGeo = new THREE.TorusGeometry(2, 0.1, 8, 20);
            const gate = new THREE.Mesh(gateGeo, new THREE.MeshBasicMaterial({color: 0xff00ff, transparent: true, opacity: 0.8}));
            gate.position.set(Math.sin(i * 0.5) * 6, 0, -i * 35);
            scene.add(gate);
            gates.push(gate);
        }

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7);
        scene.add(light);

        animate();
    } catch (e) {
        console.error(e);
    }
}

// Math Problem Generator (Utah 7th Grade Core)
window.generateMath = () => {
    const mode = document.getElementById('mathMode').value;
    hud.style.display = 'block';
    ansInput.value = '';
    ansInput.focus();

    if(mode === 'Area') {
        let b = Math.floor(Math.random()*10)+2, h = Math.floor(Math.random()*10)+2;
        let isTri = Math.random() > 0.5;
        questionEl.innerText = isTri ? `Triangle Area: b=${b}, h=${h}` : `Parallelogram Area: b=${b}, h=${h}`;
        currentAns = isTri ? (0.5 * b * h) : (b * h);
    } else if(mode === 'TriangleInequality') {
        let a = Math.floor(Math.random()*8)+1, b = Math.floor(Math.random()*8)+1, c = Math.floor(Math.random()*15)+1;
        questionEl.innerText = `Sides: ${a}, ${b}, ${c}. Triangle? (y/n)`;
        currentAns = (a + b > c && a + c > b && b + c > a) ? 'y' : 'n';
    } else {
        let a1 = Math.floor(Math.random()*60)+20, a2 = Math.floor(Math.random()*60)+20;
        questionEl.innerText = `Angles: ${a1}°, ${a2}°. Third Angle?`;
        currentAns = 180 - a1 - a2;
    }
};

// Penalty Logic
ansInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isPenalty) {
        const val = ansInput.value.toLowerCase().trim();
        if (val == currentAns) {
            hud.style.display = 'none';
            moveSpeed = baseSpeed; // Resume normal speed
        } else {
            triggerPenalty();
        }
    }
});

function triggerPenalty() {
    isPenalty = true;
    moveSpeed = 0.05; // Slow down significantly
    penaltyTimerEl.style.display = 'block';
    ansInput.disabled = true;
    
    setTimeout(() => {
        isPenalty = false;
        penaltyTimerEl.style.display = 'none';
        ansInput.disabled = false;
        ansInput.focus();
    }, 3000);
}

function handleLap() {
    lapsCompleted++;
    if (lapsCompleted === TOTAL_LAPS - 1) {
        showBigText("FINAL LAP!", "#ffcc00");
    } else if (lapsCompleted >= TOTAL_LAPS) {
        showBigText("VICTORY!", "#00ff66");
        gameStarted = false;
        launchConfetti();
    }
    ship.position.z = 5; // Reset to start of track loop
    gates.forEach(g => g.passed = false);
}

function showBigText(text, color) {
    notificationEl.innerText = text;
    notificationEl.style.color = color;
    notificationEl.style.display = 'block';
    setTimeout(() => notificationEl.style.display = 'none', 3000);
}

function launchConfetti() {
    const group = new THREE.Group();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 150; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshBasicMaterial({color: colors[Math.floor(Math.random()*colors.length)]}));
        p.position.set(ship.position.x + (Math.random()-0.5)*10, 5, ship.position.z - 5);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*0.1, -Math.random()*0.05, (Math.random()-0.5)*0.1) };
        group.add(p);
    }
    scene.add(group);
    const animateConfetti = () => {
        group.children.forEach(c => c.position.add(c.userData.vel));
        requestAnimationFrame(animateConfetti);
    };
    animateConfetti();
}

function animate() {
    requestAnimationFrame(animate);

    // 1. Entry Animation
    if (ship.position.x < 0 && !gameStarted) {
        ship.position.x += 0.1;
    }

    // 2. Racing Logic
    if (gameStarted && hud.style.display !== 'block') {
        ship.position.z -= moveSpeed;
        ship.position.x = Math.sin(ship.position.z * 0.015) * 6;
        
        if (ship.position.z < -1300) handleLap();
    }

    // 3. Collision with Math Gates
    gates.forEach(g => {
        if (Math.abs(ship.position.z - g.position.z) < 1 && !g.passed) {
            g.passed = true;
            window.generateMath();
        }
    });

    camera.position.set(ship.position.x, 3, ship.position.z + 8);
    camera.lookAt(ship.position);
    renderer.render(scene, camera);
}

window.startRace = () => {
    gameStarted = true;
    document.getElementById('start-btn').style.display = 'none';
};

init();
