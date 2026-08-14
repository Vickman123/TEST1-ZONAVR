import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { createGallery } from './gallery.js';
import { loadExperiences, renderCatalog } from './experienceLoader.js';
import { ExperienceStation } from './ExperienceStation.js';
import { setupInteraction } from './interaction.js';

let camera, scene, renderer;
let gallery, interaction;

init();

async function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Setup de Escena
    scene = new THREE.Scene();

    // Setup de Cámara
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    // Para VR Room-scale, la cámara inicializa en 0,0,0 pero se mueve con el HMD.
    // Creamos un contenedor (dolly) para la cámara, así podemos mover al usuario libremente.
    const cameraGroup = new THREE.Group();
    cameraGroup.position.set(0, 0, 3); // Posición inicial
    scene.add(cameraGroup);
    cameraGroup.add(camera);

    // Setup de Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Añadir botón VR a la UI 2D
    const vrButton = VRButton.createButton(renderer);
    document.getElementById('vr-button-container').appendChild(vrButton);
    
    // Ocultar UI al entrar en VR
    renderer.xr.addEventListener('sessionstart', () => {
        document.body.classList.add('in-vr');
    });
    renderer.xr.addEventListener('sessionend', () => {
        document.body.classList.remove('in-vr');
    });

    // Cargar Entorno (Galería)
    gallery = createGallery(scene);

    // Cargar Interacciones (Controladores)
    interaction = setupInteraction(scene, renderer);

    // Cargar Datos (Experiencias)
    const experiences = await loadExperiences('./experiencias.json');
    renderCatalog(experiences, 'catalog-grid');
    
    // Distribuir Estaciones en forma de semicírculo
    const radius = 4;
    const angleStep = Math.PI / Math.max(1, experiences.length - 1);
    
    experiences.forEach((exp, index) => {
        const station = new ExperienceStation(exp);
        
        // Calcular posición en semicírculo
        const angle = Math.PI + (index * angleStep); // De PI a 2*PI (frente a la cámara si está en Z positivo viendo a -Z)
        
        station.position.x = Math.cos(angle) * radius;
        station.position.z = Math.sin(angle) * radius;
        
        // Orientar la estación hacia el centro (0,0,0)
        station.lookAt(0, 0, 0);
        
        scene.add(station);
        
        // Registrar el botón de la estación en el sistema de interacción
        interaction.addInteractable(station.buttonMesh);
    });

    // Eventos
    window.addEventListener('resize', onWindowResize);

    // Loop
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(time) {
    if (gallery) gallery.update(time);
    if (interaction) interaction.update();
    
    renderer.render(scene, camera);
}
