import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, ghostShip;
let gates = [], currentAns = null;
let playbackData = JSON.parse(localStorage.getItem('bestRun')) || [];
let currentRun = [];
let frameCounter = 0;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Player Ship
    const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
    ship = new THREE.Mesh(shipGeo, new THREE.MeshPhongMaterial({ color: 0x00ffcc }));
    ship.rotation.x = Math.PI/2;
    scene.add(ship);

    // Ghost Ship (Semi-transparent)
    ghostShip = new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.3 
    }));
    ghostShip.rotation.x = Math.PI/2;
    scene.add(ghostShip);

    // Track Lights
    const ambient = new THREE.AmbientLight(0x404040); 
    scene.add(ambient);
    const light = new THREE.PointLight(0xffffff, 1, 100);
    scene.add(light);

    // Build Track
    for(let i=0; i<150; i++) {
        const gateGeo = new THREE.TorusGeometry(2, 0.05, 10, 30);
        const gate = new THREE.Mesh(gateGeo, new THREE.MeshBasicMaterial({color: 0x00ffff}));
        gate.position.set(Math.sin(i * 0.3) * 6, 0, -i * 25);
        scene.add(gate);
        gates.push(gate);
    }

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if(document.getElementById('hud').style.display !== 'block') {
        // Move Ship
        ship.position.z -= 0.2; 
        ship.position.x = Math.sin(ship.position.z * 0.012) * 6; // Follow track path
        
        // Record for Ghost
        currentRun.push({ x: ship.position.x, z: ship.position.z });

        // Playback Ghost
        if(playbackData[frameCounter]) {
            ghostShip.position.set(playbackData[frameCounter].x, 0, playbackData[frameCounter].z);
            frameCounter++;
        }

        camera.position.set(ship.position.x, 2, ship.position.z + 6);
        camera.lookAt(ship.position);
    }

    // Check for Finish (Last Gate)
    if(ship.position.z < -3700) {
        finishRace();
    }

    renderer.render(scene, camera);
}

function finishRace() {
    // If current run is faster or no run exists, save it
    if(!playbackData.length || currentRun.length < playbackData.length) {
        localStorage.setItem('bestRun', JSON.stringify(currentRun));
        alert("New Personal Best! Ghost Updated.");
    }
    location.reload(); 
}

// Math logic remains the same as previous prompt...
init();
