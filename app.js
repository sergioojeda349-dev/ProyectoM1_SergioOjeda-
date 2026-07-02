/* ============================================
   ALMACENAMIENTO DE COLORES BLOQUEADOS
   ============================================ */

let coloresBloqueados = {};

/* ============================================
   FUNCIONES AUXILIARES
   ============================================ */

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera un color aleatorio en formato HEX
 * @returns {string} Color en formato HEX (ej: #FF5733)
 */
function generarColorHEX() {
    const r = numeroAleatorio(0, 255);
    const g = numeroAleatorio(0, 255);
    const b = numeroAleatorio(0, 255);

    const toHex = (valor) => {
        const hex = valor.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Genera un color aleatorio en formato HSL
 * @returns {string} Color en formato HSL (ej: hsl(120, 75%, 50%))
 */
function generarColorHSL() {
    const h = numeroAleatorio(0, 360);
    const s = numeroAleatorio(50, 100);
    const l = numeroAleatorio(40, 70);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Convierte un color HSL a formato HEX
 * @param {string} hsl - Color en formato HSL
 * @returns {string} Color en formato HEX
 */
function hslAHex(hsl) {
    const match = hsl.match(/\d+/g);
    const h = parseInt(match[0]) / 360;
    const s = parseInt(match[1]) / 100;
    const l = parseInt(match[2]) / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/* ============================================
   NOTIFICACIONES TOAST
   ============================================ */

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {number} duracion - Duración en milisegundos (default: 2000)
 */
function mostrarToast(mensaje, duracion = 2000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;
    toast.setAttribute('role', 'status');

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('saliendo');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duracion);
}

/* ============================================
   COPIAR AL PORTAPAPELES
   ============================================ */

/**
 * Copia texto al portapapeles y muestra feedback
 * @param {string} texto - Texto a copiar
 * @param {HTMLElement} boton - Elemento del botón
 */
function copiarAlPortapapeles(texto, boton) {
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = boton.textContent;
        boton.textContent = '✓ Copiado';
        boton.classList.add('copiado');
        
        // Mostrar toast de confirmación
        mostrarToast(`✓ Código copiado: ${texto}`);

        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.classList.remove('copiado');
        }, 2000);
    }).catch(() => {
        mostrarToast('❌ Error al copiar el código', 3000);
    });
}

/* ============================================
   FUNCIÓN PRINCIPAL: GENERAR PALETA
   ============================================ */

/**
 * Genera y renderiza una paleta de colores
 */
function generarPaleta() {
    // Obtener valores seleccionados
    const tamanio = parseInt(document.getElementById('tamanio').value);
    const formato = document.getElementById('formato').value;
    const contenedorPaleta = document.getElementById('paleta');
    // PASO 1: PRIMERO, leer los colores bloqueados ANTES de limpiar
    const tarjetasExistentes = document.querySelectorAll('.color-card');
    const coloresBloqueadosPorPosicion = [];

    tarjetasExistentes.forEach((tarjeta, index) => {
        const color = tarjeta.getAttribute('data-color');
        if (coloresBloqueados[color]) {
            coloresBloqueadosPorPosicion[index] = color;
        }
    });

    
    // Limpiar contenedor anterior
    contenedorPaleta.innerHTML = '';

    // Generar array de colores
    const colores = [];
    for (let i = 0; i < tamanio; i++) {
        // Verificar si hay un color bloqueado en esa posición
        if (coloresBloqueadosPorPosicion[i]) {
            // Si está bloqueado, mantener el color
            colores.push(coloresBloqueadosPorPosicion[i]);                                
            
        } else {
            // Si no está bloqueado, generar uno nuevo
            let color;
            if(formato ==='hex') {
                color = generarColorHEX();
                
            } else {
                color = generarColorHSL();
            }
            colores.push(color);

        }
        }
    

    // Agregar clase según tamaño
    contenedorPaleta.classList.remove('paleta-6', 'paleta-8');
    contenedorPaleta.classList.add(`paleta-${tamanio}`);

    // Renderizar tarjetas de color
    colores.forEach((color, index) => {
        // Obtener código HEX para mostrar
        const colorHEX = formato === 'hex' ? color : hslAHex(color);

        // Crear tarjeta
        const tarjeta = document.createElement('article');
        tarjeta.className = 'color-card';
        tarjeta.setAttribute('role', 'region');
        tarjeta.setAttribute('aria-label', `Color ${index + 1}: ${color}`);
        tarjeta.setAttribute('data-color', color);

        // Display del color
        const display = document.createElement('div');
        display.className = 'color-display';
        display.style.backgroundColor = color;
        display.textContent = colorHEX;

        // Información del color
        const info = document.createElement('div');
        info.className = 'color-info';

        const codigoElemento = document.createElement('code');
        codigoElemento.className = 'color-codigo';
        codigoElemento.textContent = color;

        const formatoElemento = document.createElement('small');
        formatoElemento.className = 'color-formato';
        formatoElemento.textContent = `Formato: ${formato.toUpperCase()}`;

        const contenedorBotones = document.createElement('div');
        contenedorBotones.className = 'contenedor-botones';

        const botonCopiar = document.createElement('button');
        botonCopiar.className = 'boton-copiar';
        botonCopiar.textContent = '📋 Copiar';
        botonCopiar.setAttribute('aria-label', `Copiar código de color: ${color}`);
        botonCopiar.onclick = function(e) {
            e.preventDefault();
            copiarAlPortapapeles(color, botonCopiar);
        };

        const botonBloqueo = document.createElement('button');
        botonBloqueo.className = 'boton-bloqueo';
        botonBloqueo.textContent = '🔓';
        botonBloqueo.setAttribute('aria-label', 'Bloquear este color para que no cambie');
        botonBloqueo.setAttribute('data-bloqueado', 'false');
        botonBloqueo.onclick = function(e) {
            e.preventDefault();
            toggleBloqueo(botonBloqueo, tarjeta);
        };

        info.appendChild(codigoElemento);
        info.appendChild(formatoElemento);
        contenedorBotones.appendChild(botonCopiar);
        contenedorBotones.appendChild(botonBloqueo);
        info.appendChild(contenedorBotones);

        tarjeta.appendChild(display);
        tarjeta.appendChild(info);

        contenedorPaleta.appendChild(tarjeta);
    });

    // Mostrar notificación de éxito
    mostrarToast(`✓ Paleta de ${tamanio} colores generada en formato ${formato.toUpperCase()}`);
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

// Evento del botón principal
document.getElementById('btn-generar').addEventListener('click', generarPaleta);

// Permitir generar con Enter en los selects
document.getElementById('tamanio').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generarPaleta();
    }
});

document.getElementById('formato').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generarPaleta();
    }
});

// Generar paleta al cargar la página
window.addEventListener('load', generarPaleta);


/* ============================================
   BLOQUEO/DESBLOQUEO DE COLORES
   ============================================ */

/**
 * Alterna el estado de bloqueo de un color
 * @param {HTMLElement} boton - Botón de bloqueo
 * @param {HTMLElement} tarjeta - Tarjeta del color
 */
function toggleBloqueo(boton, tarjeta) {
    const color = tarjeta.getAttribute('data-color');
    const estasBloqueado = boton.getAttribute('data-bloqueado') === 'true';
    
    if (estasBloqueado) {
        // Desbloquear
        boton.textContent = '🔓';
        boton.setAttribute('data-bloqueado', 'false');
        boton.setAttribute('aria-label', 'Bloquear este color');
        tarjeta.classList.remove('bloqueado');
        delete coloresBloqueados[color];
        mostrarToast('🔓 Color desbloqueado');
    } else {
        // Bloquear
        boton.textContent = '🔒';
        boton.setAttribute('data-bloqueado', 'true');
        boton.setAttribute('aria-label', 'Desbloquear este color');
        tarjeta.classList.add('bloqueado');
        coloresBloqueados[color] = true;
        mostrarToast('🔒 Color bloqueado - No cambiará');
    }
}