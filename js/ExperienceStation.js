import * as THREE from 'three';

export class ExperienceStation extends THREE.Group {
    constructor(data) {
        super();
        this.data = data;
        this.isStation = true;
        
        // Colores base
        this.baseColor = 0x002B5C;
        this.hoverColor = 0xD4AF37;
        
        this.buildStation();
    }

    buildStation() {
        // 1. Pedestal base
        const pedestalGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 16);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: this.baseColor,
            roughness: 0.2,
            metalness: 0.8
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = 0.5; // Sobre el suelo
        this.add(pedestal);

        // 2. Panel principal / Pantalla holográfica
        const panelGeometry = new THREE.PlaneGeometry(1, 1.2);
        
        // Crear textura dinámica para el texto
        const canvasText = this.createTextTexture(this.data.nombre, this.data.categoria);
        const textTexture = new THREE.CanvasTexture(canvasText);
        
        const panelMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.y = 1.6; // Altura del pecho/ojos
        this.add(panel);

        // 3. Botón de "ENTRAR" (Interactuable)
        const btnGeometry = new THREE.PlaneGeometry(0.6, 0.2);
        
        // Textura del botón
        const btnCanvas = this.createButtonTexture("ENTRAR", false);
        const btnTexture = new THREE.CanvasTexture(btnCanvas);
        
        this.btnMaterial = new THREE.MeshBasicMaterial({
            map: btnTexture,
            transparent: true
        });
        
        this.buttonMesh = new THREE.Mesh(btnGeometry, this.btnMaterial);
        this.buttonMesh.position.set(0, 1.1, 0.1); // Debajo del panel principal
        // Atributos de interacción
        this.buttonMesh.userData = {
            isInteractable: true,
            url: this.data.url,
            station: this
        };
        
        this.add(this.buttonMesh);
    }

    createTextTexture(name, category) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, 0, 512, 512);
        
        // Borde
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 502, 502);

        // Texto
        ctx.fillStyle = '#F8FAFC';
        ctx.textAlign = 'center';
        
        // Nombre
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(name, 256, 120);
        
        // Categoría
        ctx.fillStyle = '#D4AF37';
        ctx.font = '32px sans-serif';
        ctx.fillText(category, 256, 180);

        // "Imagen" placeholder (si se quisiera cargar una real en textura, sería asíncrono, para MVP pintamos un bloque)
        ctx.fillStyle = '#002B5C';
        ctx.fillRect(50, 220, 412, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.fillText("Previsualización", 256, 330);

        return canvas;
    }

    createButtonTexture(text, isHovered) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Fondo
        ctx.fillStyle = isHovered ? '#D4AF37' : '#002B5C';
        ctx.beginPath();
        ctx.roundRect(0, 0, 256, 64, 10);
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = isHovered ? '#FFFFFF' : '#D4AF37';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Texto
        ctx.fillStyle = isHovered ? '#002B5C' : '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(text, 128, 32);

        return canvas;
    }

    setHoverState(isHovered) {
        const newTexture = new THREE.CanvasTexture(this.createButtonTexture("ENTRAR", isHovered));
        this.btnMaterial.map.dispose(); // Limpiar memoria
        this.btnMaterial.map = newTexture;
    }
}
