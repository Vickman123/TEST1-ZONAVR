export async function loadExperiences(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading experiences:", error);
        return [];
    }
}

// Función para poblar la UI 2D en PC
export function renderCatalog(experiences, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    experiences.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        
        card.innerHTML = `
            <h3>${exp.nombre}</h3>
            <span class="category">${exp.categoria}</span>
            <p>${exp.descripcion}</p>
            <p><strong>Duración:</strong> ${exp.duracion}</p>
            <a href="${exp.url}" class="catalog-btn" target="_blank" rel="noopener noreferrer">Ver Experiencia</a>
        `;
        
        container.appendChild(card);
    });
}
