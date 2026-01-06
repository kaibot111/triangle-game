import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, roomCode, isSolo = true;
let gates = [], obstacles = [], currentAns = null;
const socket = io();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ship
    const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
    const shipMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc });
    ship = new THREE.Mesh(shipGeo, shipMat);
    ship.rotation.x = Math.PI/2;
    scene.add(ship);

    // Track Generation (Procedural)
    for(let i=0; i<100; i++) {
        const gateGeo = new THREE.TorusGeometry(2, 0.1, 8, 20);
        const gate = new THREE.Mesh(gateGeo, new THREE.MeshBasicMaterial({color: 0xff00ff}));
        gate.position.z = -i * 20;
        gate.position.x = Math.sin(i * 0.5) * 5;
        scene.add(gate);
        gates.push(gate);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5, 5);
    scene.add(light);
    animate();
}

// Math Problem Logic (Utah Standards)
window.generateMath = () => {
    const mode = document.getElementById('mathMode').value;
    const hud = document.getElementById('hud');
    const q = document.getElementById('question');
    hud.style.display = 'block';

    if(mode === 'Area') {
        let b = Math.floor(Math.random()*10)+2, h = Math.floor(Math.random()*10)+2;
        q.innerText = `Triangle: b=${b}, h=${h}. Area?`;
        currentAns = (0.5 * b * h).toString();
    } else if(mode === 'TriangleInequality') {
        let a = 5, b = 10, c = Math.floor(Math.random()*20)+1;
        q.innerText = `Sides: ${a}, ${b}, ${c}. Triangle? (y/n)`;
        currentAns = (a + b > c && a + c > b && b + c > a) ? 'y' : 'n';
    } else {
        let a1 = 60, a2 = 70;
        q.innerText = `Angles: ${a1}, ${a2}. Missing angle?`;
        currentAns = (180 - a1 - a2).toString();
    }
};

function animate() {
    requestAnimationFrame(animate);
    if(document.getElementById('hud').style.display !== 'block') {
        ship.position.z -= 0.15; // Constant Speed
        camera.position.set(ship.position.x, ship.position.y + 1, ship.position.z + 4);
    }

    // Check for Gate Collision
    gates.forEach(g => {
        if(Math.abs(ship.position.z - g.position.z) < 0.5 && !g.passed) {
            g.passed = true;
            window.generateMath();
        }
    });

    renderer.render(scene, camera);
}

// UI Handlers
window.toggleSolo = () => { isSolo = !isSolo; document.getElementById('soloBtn').innerText = `Solo Mode: ${isSolo ? 'ON' : 'OFF'}`; };
document.getElementById('ans').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        if(e.target.value == currentAns) {
            document.getElementById('hud').style.display = 'none';
            e.target.value = '';
        }
    }
});

init();
