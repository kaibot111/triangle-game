import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, ghostShip;
let gates = [], currentAns = null, mathStartTime = 0;
let isBoosting = false, isSolo = true;
let playbackData = JSON.parse(localStorage.getItem('bestRun')) || [];
let currentRun = [];
let frameCounter = 0;

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000008);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7);
        scene.add(sun);

        // Ship
        const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
        ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial({ color: 0x00ffcc }));
        ship.rotation.x = Math.PI/2;
        scene.add(ship);

        // Ghost
        ghostShip = new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
        ghostShip.rotation.x = Math.PI/2;
        scene.add(ghostShip);

        // Track
        for(let i=0; i<150; i++) {
            const gateGeo = new THREE.TorusGeometry(2, 0.1, 10, 30);
            const gate = new THREE.Mesh(gateGeo, new THREE.MeshBasicMaterial({color: 0xff00ff}));
            gate.position.set(Math.sin(i * 0.4) * 7, 0, -i * 35);
            scene.add(gate);
            gates.push(gate);
        }

        animate();
    } catch (e) {
        document.body.innerHTML = `<div style="color:white;text-align:center;"><h1>Load Error</h1><p>${e.message}</p></div>`;
    }
}

window.generateMath = () => {
    const mode = document.getElementById('mathMode').value;
    const hud = document.getElementById('hud');
    const q = document.getElementById('question');
    const type = document.getElementById('question-type');
    
    mathStartTime = Date.now();
    hud.style.display = 'block';
    document.getElementById('ans').focus();

    if(mode === 'Area') {
        type.innerText = "FIND THE AREA";
        let b = Math.floor(Math.random()*10)+2, h = Math.floor(Math.random()*10)+2;
        let isTri = Math.random() > 0.5;
        q.innerText = isTri ? `Triangle: b=${b}, h=${h}` : `Parallelogram: b=${b}, h=${h}`;
        currentAns = isTri ? (0.5 * b * h) : (b * h);
    } else if(mode === 'TriangleInequality') {
        type.innerText = "CAN THIS BE A TRIANGLE? (y/n)";
        let a = Math.floor(Math.random()*10)+1, b = Math.floor(Math.random()*10)+1, c = Math.floor(Math.random()*15)+1;
        q.innerText = `Sides: ${a}, ${b}, ${c}`;
        currentAns = (a + b > c && a + c > b && b + c > a) ? 'y' : 'n';
    } else {
        type.innerText = "FIND THE MISSING ANGLE";
        let a1 = Math.floor(Math.random()*70)+20, a2 = Math.floor(Math.random()*70)+20;
        q.innerText = `Angles: ${a1}°, ${a2}°, ?°`;
        currentAns = 180 - a1 - a2;
    }
};

function animate() {
    requestAnimationFrame(animate);
    if(document.getElementById('hud').style.display !== 'block') {
        const speed = isBoosting ? 0.7 : 0.3;
        ship.position.z -= speed;
        ship.position.x = Math.sin(ship.position.z * 0.011) * 7;
        
        currentRun.push({ x: ship.position.x, z: ship.position.z });
        if(playbackData[frameCounter]) {
            ghostShip.position.set(playbackData[frameCounter].x, 0, playbackData[frameCounter].z);
            frameCounter++;
        }
        camera.position.set(ship.position.x, 3, ship.position.z + 8);
        camera.lookAt(ship.position.x, 0, ship.position.z - 5);
    }

    gates.forEach(g => {
        if(Math.abs(ship.position.z - g.position.z) < 1 && !g.passed) {
            g.passed = true;
            window.generateMath();
        }
    });
    renderer.render(scene, camera);
}

window.toggleSolo = () => { isSolo = !isSolo; document.getElementById('soloBtn').innerText = `Solo Mode: ${isSolo ? 'ON' : 'OFF'}`; };

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && document.getElementById('hud').style.display === 'block') {
        const val = document.getElementById('ans').value.toLowerCase();
        if(val == currentAns) {
            const time = (Date.now() - mathStartTime) / 1000;
            document.getElementById('hud').style.display = 'none';
            document.getElementById('ans').value = '';
            if(time < 5) {
                isBoosting = true;
                document.getElementById('boost-timer').style.display = 'block';
                setTimeout(() => { 
                    isBoosting = false; 
                    document.getElementById('boost-timer').style.display = 'none';
                }, 4000);
            }
        }
    }
});

init();
