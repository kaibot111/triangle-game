import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, gameStarted = false;
let opponents = {}, gates = [], currentAns = null;
let isPenalty = false, moveSpeed = 0.25;
let lapsCompleted = 0;
const TOTAL_LAPS = 3; 

const socket = io();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 1. Checkered Line (Start/Finish)
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

    // 2. Player Ship
    const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
    ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial({ color: 0x00ffcc }));
    ship.position.set(-15, 0, 0); 
    ship.rotation.x = Math.PI/2;
    scene.add(ship);

    // 3. Track Gates (Utah Core Geometry Gates)
    for(let i=1; i<40; i++) {
        const gate = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1, 8, 20), new THREE.MeshBasicMaterial({color: 0xff00ff}));
        gate.position.set(Math.sin(i * 0.5) * 5, 0, -i * 30);
        scene.add(gate);
        gates.push(gate);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);

    animate();
}

// Confetti Effect
function launchConfetti() {
    const group = new THREE.Group();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 100; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: colors[Math.floor(Math.random()*colors.length)]}));
        p.position.set(ship.position.x + (Math.random()-0.5)*5, 5, ship.position.z - 5);
        p.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.2, -Math.random()*0.1, (Math.random()-0.5)*0.2) };
        group.add(p);
    }
    scene.add(group);
    // Animate falling confetti
    const cAnim = () => {
        group.children.forEach(c => {
            c.position.add(c.userData.velocity);
            c.rotation.x += 0.1;
        });
        requestAnimationFrame(cAnim);
    };
    cAnim();
}

function handleLapCompletion() {
    lapsCompleted++;
    if (lapsCompleted === TOTAL_LAPS - 1) {
        showNotification("FINAL LAP!", "#ffcc00");
    } else if (lapsCompleted >= TOTAL_LAPS) {
        showNotification("FINISH! YOU WIN!", "#00ff66");
        launchConfetti();
        gameStarted = false;
    }
    // Teleport back to start line to loop the track
    ship.position.z = 5; 
    gates.forEach(g => g.passed = false);
}

function showNotification(text, color) {
    const note = document.getElementById('notification');
    note.innerText = text;
    note.style.color = color;
    note.style.display = 'block';
    setTimeout(() => { note.style.display = 'none'; }, 3000);
}

function animate() {
    requestAnimationFrame(animate);

    if (ship.position.x < 0 && !gameStarted) {
        ship.position.x += 0.15;
    }

    if (gameStarted && document.getElementById('hud').style.display !== 'block') {
        ship.position.z -= moveSpeed;
        ship.position.x = Math.sin(ship.position.z * 0.02) * 5;

        // Check for lap completion (passing z=0 from the negative side)
        if (ship.position.z < -1200) { 
            handleLapCompletion();
        }
    }

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

window.startRace = () => { gameStarted = true; document.getElementById('start-btn').style.display = 'none'; };
init();
