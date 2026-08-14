import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';

export function setupInteraction(scene, renderer, cameraGroup) {
    const interactables = [];
    let hoveredButton = null;

    // Estado para Locomoción (Grab and Pull)
    let draggingController = null;
    const previousHandPosition = new THREE.Vector3();
    const currentHandPosition = new THREE.Vector3();

    // Controladores (Punteros)
    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    // Modelos visuales para los controladores
    const controllerModelFactory = new XRControllerModelFactory();
    
    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    // Hand Tracking (Manos físicas)
    const handModelFactory = new XRHandModelFactory();
    
    // Perfil 'spheres' es ligero y no requiere descargas extrañas de glTF por CORS
    const hand1 = renderer.xr.getHand(0);
    hand1.add(handModelFactory.createHandModel(hand1, 'spheres'));
    scene.add(hand1);

    const hand2 = renderer.xr.getHand(1);
    hand2.add(handModelFactory.createHandModel(hand2, 'spheres'));
    scene.add(hand2);

    // Rayos visibles
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    ]);
    const line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    function onSelectStart(event) {
        const controller = event.target;
        
        // Comprobar intersecciones al presionar el gatillo / pellizcar
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects(interactables, false);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            const object = intersection.object;
            
            if (object.userData && object.userData.isInteractable) {
                // Redirigir a la URL
                console.log("Navigating to: " + object.userData.url);
                window.location.href = object.userData.url;
            }
        } else {
            // Si no intersectó con un botón, iniciar Locomoción (Drag)
            draggingController = controller;
            previousHandPosition.setFromMatrixPosition(controller.matrixWorld);
        }
    }

    function onSelectEnd(event) {
        if (draggingController === event.target) {
            draggingController = null;
        }
    }

    function getIntersections(controller) {
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return raycaster.intersectObjects(interactables, false);
    }

    function update() {
        // --- 1. Lógica de Hover (Rayos) ---
        let intersectionFound = false;
        let intersects = getIntersections(controller1);
        
        if (intersects.length === 0) {
            intersects = getIntersections(controller2);
        }

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData && object.userData.isInteractable) {
                intersectionFound = true;
                if (hoveredButton !== object) {
                    if (hoveredButton) {
                        hoveredButton.userData.station.setHoverState(false);
                    }
                    hoveredButton = object;
                    hoveredButton.userData.station.setHoverState(true);
                }
            }
        }

        if (!intersectionFound && hoveredButton) {
            hoveredButton.userData.station.setHoverState(false);
            hoveredButton = null;
        }

        // --- 2. Lógica de Locomoción (Grab and Pull) ---
        if (draggingController) {
            currentHandPosition.setFromMatrixPosition(draggingController.matrixWorld);
            
            // Calculamos el diferencial de movimiento de la mano
            const delta = new THREE.Vector3().subVectors(currentHandPosition, previousHandPosition);
            
            // Movemos la cámara en dirección CONTRARIA (si jalo hacia mi, me muevo hacia adelante)
            // IMPORTANTE: Ignoramos el eje Y para no volar o hundirnos en el suelo
            delta.y = 0; 
            
            cameraGroup.position.sub(delta);
            
            // Actualizamos la posición previa para el siguiente frame (en coordenadas locales de la cámara)
            // Dado que movimos el cameraGroup, la posición en el mundo de la mano ya incluye ese movimiento,
            // pero para evitar feedback positivo infinito, leemos la nueva posición post-movimiento
            previousHandPosition.setFromMatrixPosition(draggingController.matrixWorld);
        }
    }

    return {
        update,
        addInteractable: (mesh) => {
            interactables.push(mesh);
        }
    };
}
