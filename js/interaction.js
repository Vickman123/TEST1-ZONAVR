import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export function setupInteraction(scene, renderer) {
    const interactables = [];
    let hoveredButton = null;

    // Controladores
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
        
        // Comprobar intersecciones al presionar el gatillo
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
                // En Quest, window.location.href en VR a veces saca al usuario o carga directo si es WebXR.
                window.location.href = object.userData.url;
            }
        }
    }

    function onSelectEnd(event) {
        // Nada de momento
    }

    function getIntersections(controller) {
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return raycaster.intersectObjects(interactables, false);
    }

    function update() {
        let intersectionFound = false;

        // Comprobar intersecciones del controller 1
        let intersects = getIntersections(controller1);
        
        if (intersects.length === 0) {
            // Si el 1 no intersecta, probar el 2
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
    }

    return {
        update,
        addInteractable: (mesh) => {
            interactables.push(mesh);
        }
    };
}
