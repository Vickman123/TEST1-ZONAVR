# Galería Inmersiva PC PUMA XR

Bienvenido a la Galería Inmersiva PC PUMA XR. Este es un MVP de una experiencia WebXR diseñada para ser ejecutada directamente en Meta Quest 3S (y navegadores modernos de PC), actuando como un portal hacia otras experiencias de realidad virtual.

https://vickman123.github.io/TEST1-ZONAVR/

## Características

- 🚀 **Tecnología Vanilla**: Desarrollado con HTML, CSS, JavaScript y Three.js puros.
- 👓 **Soporte WebXR Nativo**: Optimizado para Meta Quest 3S.
- 🥽 **Modo Dual AR/VR**: Selector en la pantalla inicial para visualizar en VR (Inmersivo) o AR (Realidad Mixta/Passthrough con cámara activa).
- 🖐️ **Hand Tracking y Controladores**: Usa tus controladores físicos, o usa el seguimiento nativo de manos para apuntar e interactuar (pellizco).
- 🚶 **Movimiento Libre ("Grab & Pull")**: Muévete por la galería pellizcando el vacío con tu mano y "jalando" el espacio hacia ti, sin necesidad de joysticks.
- 📁 **JSON Dinámico**: Base de datos de experiencias escalable.

---

## 1. Cómo instalar/ejecutar localmente

Ya que este proyecto no usa un empaquetador, **solo necesitas servir los archivos estáticos a través de un servidor HTTP local**. No puedes simplemente abrir el `index.html` haciendo doble clic por las restricciones de CORS de los navegadores al leer el archivo JSON y usar ES Modules.

### Opción A: Usando VS Code (Recomendado)
1. Instala la extensión **Live Server** en Visual Studio Code.
2. Abre la carpeta del proyecto en VS Code.
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

### Opción B: Usando Python
Si tienes Python instalado:
1. Abre tu terminal (PowerShell o CMD).
2. Navega a la carpeta del proyecto: `cd C:\Users\TU_USUARIO\Desktop\WEBAPPVR`
3. Ejecuta: `python -m http.server 8000`
4. Abre en tu navegador de PC: `http://localhost:8000`

---

## 2. Cómo abrir en PC

Una vez que el servidor local esté corriendo, simplemente abre tu navegador web (Chrome, Edge, Firefox) y entra a `http://localhost:8000` (o el puerto que te asigne Live Server). Verás la interfaz 2D con la lista de experiencias disponibles. 

---

## 3. Cómo probar en Meta Quest 3S

Meta Quest Browser requiere un entorno seguro (**HTTPS**) para habilitar las funcionalidades WebXR (o usar `localhost`).

### Método más fácil (GitHub Pages)
La forma más sencilla de probar en Quest es [desplegar el proyecto en GitHub Pages](#4-cómo-desplegar-en-github-pages) y abrir esa URL pública desde el visor.

### Método Local (Port Forwarding o ngrok)
Si quieres probar localmente antes de publicar:
1. **ngrok**: Instala ngrok en tu PC. Corre tu servidor local en el puerto 8000, y en otra terminal ejecuta `ngrok http 8000`. Ngrok te dará una URL HTTPS (ej. `https://abcd-12-34.ngrok.io`). Escribe esa URL en el navegador de tu Quest 3S.
2. **Quest Link / Air Link**: Conecta tu Quest a la PC, abre el navegador de Quest y dirígete a la IP de tu computadora (ej. `http://192.168.1.XX:8000`). Para que WebXR funcione sin HTTPS por IP local, podrías necesitar habilitar *Insecure origins treated as secure* en `chrome://flags` dentro del Meta Quest Browser, añadiendo tu IP.

---

## 4. Cómo desplegar en GitHub Pages

Dado que este proyecto está compuesto 100% de archivos estáticos (HTML/CSS/JS), el despliegue es inmediato:

1. Crea un repositorio en tu cuenta de GitHub (ej. `pc-puma-xr`).
2. Sube todo el contenido de esta carpeta (excepto archivos temporales) a ese repositorio.
3. Ve a la pestaña **Settings** (Configuración) de tu repositorio.
4. En la barra lateral izquierda, selecciona **Pages**.
5. Bajo *Build and deployment*, en **Source**, selecciona **Deploy from a branch**.
6. En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`. Haz clic en **Save**.
7. En unos minutos, GitHub te dará una URL (ej. `https://tu-usuario.github.io/pc-puma-xr/`). 
8. ¡Abre esa URL en tu Meta Quest 3S y presiona "ENTER VR"!

---

## 5. Cómo agregar una nueva experiencia

¡Es muy sencillo! No necesitas tocar el código JavaScript.
Abre el archivo `experiencias.json` y agrega un nuevo bloque a la lista:

```json
  {
    "id": "mi-nueva-experiencia",
    "nombre": "Mi Simulador",
    "categoria": "Arquitectura",
    "descripcion": "Descripción breve de la experiencia.",
    "imagen": "assets/images/placeholder.jpg",
    "url": "https://url-de-mi-experiencia.com",
    "duracion": "15 min",
    "tipo": "WebXR"
  }
```

La próxima vez que recargues la página, se generará automáticamente una nueva estación (tótem) en el espacio 3D y una nueva tarjeta en la interfaz 2D.

---

## 6. Cómo cambiar una URL

Simplemente abre `experiencias.json`, busca la experiencia que deseas modificar y edita el valor de la propiedad `"url"`. Asegúrate de que las URLs comiencen con `https://`.

---

## 7. Cómo agregar imágenes

1. Coloca tus imágenes JPG o PNG en la carpeta `assets/images/`.
2. Actualiza la ruta en el archivo `experiencias.json` dentro de la propiedad `"imagen"`.
*(Nota: En esta Fase 1 (MVP), las texturas de imágenes sobre los tótems 3D están simuladas con un canvas para garantizar máximo rendimiento. Se pueden cargar como texturas reales en futuras iteraciones de `ExperienceStation.js`).*

---

## 8. Limitaciones conocidas de WebXR en Meta Quest Browser

- **Navegación entre dominios (CORS)**: Navegar directamente desde un entorno VR (`window.location.href = ...`) a otra URL externa WebXR a veces saca al usuario del modo inmersivo de Quest, obligándolo a presionar "Enter VR" nuevamente en la nueva página. Esto es una medida de seguridad nativa de los navegadores para prevenir secuestros de sesión VR.
- **Rendimiento**: Un exceso de texturas de alta resolución (como canvas de texto grandes) puede causar caídas de frames en VR standalone. El MVP está optimizado con materiales básicos (`MeshBasicMaterial` y `MeshStandardMaterial`).

---

## 9. Qué funcionalidades requieren hand tracking y cómo usarlas

- **Apuntar y Seleccionar**: Con el hand tracking activo (deja los mandos sobre la mesa), verás esferas representando tus manos. Para interactuar con los botones de la galería, apunta y haz un **gesto de pellizco** (junta el dedo índice con el pulgar) como si fuera el gatillo del control.
- **Locomoción Drag (Grab and Pull)**: Si deseas moverte por la sala sin caminar físicamente, apunta hacia el aire (donde no haya ningún botón), haz el **gesto de pellizco y mantenlo cerrado**. Mueve tu mano en el aire como si estuvieras agarrando y jalando el espacio. La cámara se moverá suavemente en la dirección opuesta, permitiéndote "navegar" con tus brazos libremente.

---

## 10. Qué funcionalidades dependen del soporte específico del navegador/dispositivo

- **Botón Enter VR**: Depende de la API `navigator.xr`. Si el navegador (ej. Safari en iOS sin soporte) no es compatible, Three.js mostrará el mensaje "WebXR Not Supported".
- **Room-scale tracking**: Depende de los sensores integrados del visor para desplazar la cámara física cuando el usuario camina por su habitación. Esto está soportado nativamente en Meta Quest 3S.

---
*Desarrollado para la Universidad Nacional Autónoma de México (UNAM) - PC PUMA.*
