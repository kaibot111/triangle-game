function init() {
    try {
        // 1. Scene & Background Failsafe
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000010); // Very dark blue to verify rendering

        // 2. Camera Setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // 3. Renderer Setup
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // 4. Lighting (Crucial so objects aren't black/invisible)
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7);
        scene.add(sun);

        // 5. Player Ship
        const shipGeo = new THREE.ConeGeometry(0.3, 1, 8);
        const shipMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc });
        ship = new THREE.Mesh(shipGeo, shipMat);
        ship.rotation.x = Math.PI / 2;
        scene.add(ship);

        // 6. Ghost Ship (Semi-transparent)
        ghostShip = new THREE.Mesh(shipGeo, new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.3 
        }));
        ghostShip.rotation.x = Math.PI / 2;
        scene.add(ghostShip);

        // 7. Track/Gate Generation
        for(let i = 0; i < 150; i++) {
            const gateGeo = new THREE.TorusGeometry(2, 0.1, 10, 30);
            const gateMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
            const gate = new THREE.Mesh(gateGeo, gateMat);
            gate.position.set(Math.sin(i * 0.4) * 7, 0, -i * 30);
            scene.add(gate);
            gates.push(gate);
        }

        console.log("Scene initialized successfully.");
        animate();

    } catch (error) {
        // EMERGENCY OVERLAY: Shows if the code crashes
        console.error("CRITICAL ERROR:", error);
        document.body.style.backgroundColor = "black";
        document.body.innerHTML = `
            <div style="color: white; padding: 50px; font-family: sans-serif; text-align: center;">
                <h1 style="color: #ff4444;">Game Initialization Failed</h1>
                <p>Error: ${error.message}</p>
                <p style="font-size: 0.8em; color: #888;">Check browser console for details.</p>
                <button onclick="location.reload()" style="padding: 10px 20px;">Retry Load</button>
            </div>
        `;
    }
}
