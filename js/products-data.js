// js/products-data.js
// Catálogo cargado de forma asíncrona desde la misma tabla Supabase que usa el panel admin
// (js/admin.js), en vez de un array fijo. Así lo que se edita en /pages/admin.html
// se refleja al instante en la tienda pública.

// Prefijo PF_ para no chocar con SUPABASE_URL/SUPABASE_ANON_KEY que ya
// declara js/supabase-config.js en las páginas que cargan ambos scripts
// (admin.html, login.html, registro.html) — dos `const` con el mismo
// nombre en scripts clásicos comparten el mismo scope global y rompen.
const PF_SUPABASE_URL = 'https://elnxlsydfdndolrcdyri.supabase.co';
const PF_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc';
const PRODUCTS_CACHE_KEY = 'puntofit-products-cache';

const categoryInfo = {
    proteina: {
        title: "Proteínas",
        icon: "fa-dumbbell",
        description: "Las proteínas son el pilar para la recuperación y el crecimiento muscular. Ideales después del entrenamiento o como complemento diario según tu objetivo.",
        benefits: [
            "Apoyan la síntesis de proteína muscular",
            "Mejoran la recuperación post-entreno",
            "Ayudan a alcanzar tu requerimiento diario de proteína"
        ],
        usage: "1 scoop (25–30 g) mezclado con agua o leche, preferiblemente después de entrenar."
    },
    creatina: {
        title: "Creatinas",
        icon: "fa-bolt",
        description: "La creatina aumenta la energía disponible para ejercicios de alta intensidad, mejorando fuerza y rendimiento en series cortas y explosivas.",
        benefits: [
            "Incrementan fuerza y potencia",
            "Mejoran el rendimiento en entrenamientos intensos",
            "Uno de los suplementos más estudiados y seguros"
        ],
        usage: "5 g diarios, en cualquier momento del día. Mantén hidratación adecuada."
    },
    aminoacidos: {
        title: "Aminoácidos",
        icon: "fa-flask",
        description: "Los aminoácidos (BCAA, glutamina, etc.) apoyan la recuperación, reducen el cansancio muscular y ayudan a preservar masa magra.",
        benefits: [
            "Apoyan la recuperación muscular",
            "Pueden reducir la fatiga durante el entreno",
            "Complementan tu plan de nutrición deportiva"
        ],
        usage: "Según el producto: generalmente antes, durante o después del entrenamiento."
    },
    "pre-workout": {
        title: "Pre-Entrenos",
        icon: "fa-fire",
        description: "Fórmulas diseñadas para darte energía, enfoque y resistencia antes de entrenar. Perfectas para sesiones exigentes.",
        benefits: [
            "Más energía y concentración",
            "Mejor bombeo muscular (pump)",
            "Rendimiento optimizado en cada sesión"
        ],
        usage: "1 porción 20–30 minutos antes de entrenar. No exceder la dosis recomendada."
    }
};

// Mapea una fila de la tabla `productos` (Supabase) al shape que ya usa
// toda la UI (name, category, price, img...). Beneficios y modo de uso todavía
// no son columnas en la tabla, así que se completan con el genérico de su categoría.
function mapProductoRow(row) {
    const info = categoryInfo[row.categoria];
    return {
        id: row.id,
        name: row.nombre,
        category: row.categoria,
        price: Number(row.precio),
        stock: row.inventario,
        img: row.imagen_url,
        brand: row.marca || '',
        description: row.descripcion || '',
        benefits: info?.benefits || [],
        usage: info?.usage || ''
    };
}

// ════════════════════════════════════════════════════════════════
// ACTUALIZACIÓN ASÍNCRONA — Función AJAX de jQuery ($.ajax)
// ════════════════════════════════════════════════════════════════
// Tecnología del cliente : jQuery $.ajax(). Por debajo, jQuery arma
//   y despacha un objeto XMLHttpRequest (en navegadores muy antiguos
//   usaba ActiveXObject como respaldo) para hacer la petición HTTP
//   sin recargar la página.
// Tecnología del servidor: Supabase (PostgREST sobre PostgreSQL),
//   que expone la tabla `productos` como un endpoint REST.
// ════════════════════════════════════════════════════════════════

// ── 1. Requerimientos ────────────────────────────────────────────
// Para pedir el catálogo hacen falta: la URL del endpoint REST, el
// verbo HTTP (GET), y las credenciales que exige Supabase (RLS) para
// autorizar la lectura pública de la tabla `productos`.
const PRODUCTOS_ENDPOINT = `${PF_SUPABASE_URL}/rest/v1/productos?select=*&order=id.asc`;

// Traduce el código de estado HTTP de la respuesta a un mensaje
// entendible (rangos vistos en clase: 1xx, 2xx, 3xx, 4xx, 5xx).
function describeHttpError(status) {
    if (!status) return 'Sin conexión con el servidor (fallo de red).';
    if (status === 400) return `400 Bad Request: la solicitud está mal formada.`;
    if (status === 401) return `401 Unauthorized: credenciales inválidas o ausentes.`;
    if (status === 403) return `403 Forbidden: no autorizado para leer este recurso.`;
    if (status === 404) return `404 Not Found: el recurso solicitado no existe.`;
    if (status >= 500) return `${status} Error del servidor: el servicio no está disponible.`;
    return `Error HTTP ${status} al consultar el catálogo.`;
}

function fetchProductsFromSupabase() {
    // Envolvemos $.ajax() en una Promise para poder seguir usando
    // async/await en el resto del archivo (loadProducts, getBestsellers).
    return new Promise((resolve, reject) => {

        // ── 2. Estructuración de la petición ─────────────────────
        // $.ajax() arma la petición HTTP: verbo, URL, cabeceras y el
        // tipo de dato esperado en la respuesta.
        $.ajax({
            url: PRODUCTOS_ENDPOINT,
            method: 'GET',
            dataType: 'json',
            headers: {
                apikey: PF_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${PF_SUPABASE_ANON_KEY}`
            },

            // ── 3. Manejo de la respuesta ─────────────────────────
            // Se ejecuta cuando el servidor responde con un código 2xx
            // (éxito). `rows` ya viene parseado como JSON por jQuery.
            success: function (rows, textStatus, jqXHR) {
                console.log(`[AJAX] Éxito — HTTP ${jqXHR.status} (${textStatus}), ${rows.length} productos`);
                resolve(rows.map(mapProductoRow));
            },

            // ── 4. Manejo de errores ──────────────────────────────
            // Se ejecuta ante un fallo de red o una respuesta 4xx/5xx.
            // jqXHR.status trae el código HTTP exacto devuelto por el
            // servicio (0 si nunca hubo respuesta, p. ej. sin internet).
            error: function (jqXHR, textStatus) {
                const mensaje = describeHttpError(jqXHR.status);
                console.error(`[AJAX] Error — HTTP ${jqXHR.status || 0} (${textStatus}): ${mensaje}`);
                reject(new Error(mensaje));
            }
        });
    });
}

// ── 5. Ejemplo práctico de uso ───────────────────────────────────
// loadProducts() y getBestsellers() (más abajo) consumen esta función
// con await, exactamente como cualquier otra Promise asíncrona.

let productsCache = null;

// Carga el catálogo de forma asíncrona. Cachea en memoria durante la sesión
// de la página y en localStorage como respaldo si Supabase no responde
// (por ejemplo, sin conexión a internet).
async function loadProducts() {
    if (productsCache) return productsCache;

    try {
        productsCache = await fetchProductsFromSupabase();
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsCache));
        return productsCache;
    } catch (err) {
        console.error('No se pudo cargar el catálogo desde Supabase:', err);
        const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cached) {
            productsCache = JSON.parse(cached);
            return productsCache;
        }
        throw err;
    }
}

const bestsellerCategories = ['proteina', 'creatina', 'aminoacidos', 'pre-workout'];

async function getBestsellers() {
    const list = await loadProducts();
    return bestsellerCategories.map(cat => list.find(p => p.category === cat)).filter(Boolean);
}
