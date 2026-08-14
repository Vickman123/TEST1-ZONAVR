import * as THREE from 'three';

export function createGallery(scene) {
    // 1. Iluminación básica
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Luz suave
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 2. Piso de la galería
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0F172A, // Fondo oscuro tecnológico
        roughness: 0.1,
        metalness: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Grid (rejilla) para dar aspecto de simulador / sci-fi
    const gridHelper = new THREE.GridHelper(20, 20, 0x002B5C, 0x002B5C);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 3. Paredes (Opcional, un domo o cilindro abierto queda mejor en VR)
    // Usaremos niebla de fondo para disimular el horizonte y ahorrar paredes físicas.
    scene.background = new THREE.Color(0x050810);
    scene.fog = new THREE.Fog(0x050810, 2, 12); // Niebla para efecto de infinito

    return {
        update: (time) => {
            // Animaciones del entorno si las hay
        },
        setMode: (mode) => {
            if (mode === 'ar') {
                scene.background = null;
                scene.fog = null;
                floor.visible = false;
                gridHelper.visible = false;
            } else {
                scene.background = new THREE.Color(0x050810);
                scene.fog = new THREE.Fog(0x050810, 2, 12);
                floor.visible = true;
                gridHelper.visible = true;
            }
        }
    };
}
