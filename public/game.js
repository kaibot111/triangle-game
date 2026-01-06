import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, ship, clock;
let currentMode = 'Area'; 
let mathActive = false;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create Ship (Simple Mesh)
    const geometry = new THREE.ConeGeometry(0.5, 2, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    ship = new THREE.Mesh(geometry, material);
    ship.rotation.x = Math.PI / 2;
    scene.add(ship);

    // Lighting & Environment
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 10, 10);
    scene.add(light);
    
    camera.position.z = 5;
    clock = new THREE.Clock();
    animate();
}

// MATH LOGIC - Utah Core Standards
function generateProblem() {
    const modes = {
        'Area': () => {
            const b = Math.floor(Math.random() * 12) + 1;
            const h = Math.floor(Math.random() * 10) + 1;
            const isTriangle = Math.random() > 0.5;
            return {
                text: isTriangle ? `Triangle: b=${b}, h=${h}. Area?` : `Parallelogram: b=${b}, h=${h}. Area?`,
                ans: isTriangle ? 0.5 * b * h : b * h
            };
        },
        'TriangleInequality': () => {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 20) + 1;
            return {
                text: `Sides: ${a}, ${b}, ${c}. Triangle? (y/n)`,
                ans: (a + b > c && a + c > b && b + c > a) ? 'y' : 'n'
            };
        },
        'AngleSum': () => {
            const a1 = Math.floor(Math.random() * 80) + 10;
            const a2 = Math.floor(Math.random() * 80) + 10;
            return {
                text: `Angles: ${a1}°, ${a2}°. Missing angle?`,
                ans: 180 - (a1 + a2)
            };
        }
    };
    return modes[currentMode]();
}

function animate() {
    requestAnimationFrame(animate);
    // Forward movement logic
    if(!mathActive) {
        ship.position.y += 0.1; 
        camera.position.y = ship.position.y - 5;
    }
    renderer.render(scene, camera);
}

init();
