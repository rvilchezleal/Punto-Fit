// js/ui-session.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://elnxlsydfdndolrcdyri.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc'
);

const ADMIN_EMAILS = ['admin@puntofit.com', 'rvilchezleal@gmail.com'];

export async function initSessionUI(isInPagesFolder = false) {
    const base = isInPagesFolder ? '../' : '';

    // Ocultar el contenedor mientras resolvemos la sesión
    const container = document.getElementById('auth-buttons');
    if (container) container.style.visibility = 'hidden';

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        renderLoggedOut(base);
        if (container) container.style.visibility = 'visible';
        return null;
    }

    const user = session.user;
    const nombre = user.user_metadata?.full_name || user.email.split('@')[0];

    const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol, nombre')
        .eq('id', user.id)
        .single();

    const rol = perfil?.rol || 'cliente';
    const esAdmin = rol === 'admin' || ADMIN_EMAILS.includes(user.email);
    const nombreMostrar = perfil?.nombre || nombre;

    renderLoggedIn(nombreMostrar, esAdmin, base);
    if (container) container.style.visibility = 'visible';
    return { user, rol, esAdmin, nombre: nombreMostrar };
}

function renderLoggedOut(base) {
    const container = document.getElementById('auth-buttons');
    if (!container) return;
    container.innerHTML = `
        <a href="${base}pages/login.html"
           class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
                  text-gray-700 hover:text-puntofit-red border-2 border-puntofit-red rounded-full transition">
            <i class="fas fa-user"></i>
            <span>Iniciar sesión</span>
        </a>
        <a href="${base}pages/login.html"
           class="sm:hidden p-2 text-gray-700 hover:text-puntofit-red transition"
           aria-label="Iniciar sesión">
            <i class="fas fa-user text-xl"></i>
        </a>`;
}

function renderLoggedIn(nombre, esAdmin, base) {
    const container = document.getElementById('auth-buttons');
    if (!container) return;

    container.innerHTML = `
        <div class="relative" id="user-menu-wrapper">
            <button onclick="toggleUserMenu()"
                    class="flex items-center gap-2 px-3 py-2 rounded-full border-2
                           border-puntofit-red text-sm font-semibold text-gray-700
                           hover:text-puntofit-red transition">
                <div class="w-7 h-7 rounded-full bg-puntofit-red text-white flex
                            items-center justify-center text-xs font-black">
                    ${nombre.charAt(0).toUpperCase()}
                </div>
                <span class="hidden sm:inline max-w-[120px] truncate">${nombre}</span>
                <i class="fas fa-chevron-down text-xs"></i>
            </button>

            <div id="user-dropdown"
                 class="hidden absolute right-0 mt-2 w-52 bg-white rounded-2xl
                        shadow-xl border border-gray-100 py-2 z-[200]">
                <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-xs text-gray-400 uppercase tracking-wider">Mi cuenta</p>
                    <p class="font-bold text-gray-800 truncate">${nombre}</p>
                </div>
                ${esAdmin ? `
                <a href="${base}pages/admin.html"
                   class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                          hover:bg-red-50 hover:text-puntofit-red transition">
                    <i class="fas fa-shield-alt text-puntofit-red w-4"></i>
                    Panel de Admin
                </a>` : ''}
                <a href="#"
                   onclick="handleVerCompras(event)"
                   class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                          hover:bg-red-50 hover:text-puntofit-red transition">
                    <i class="fas fa-shopping-bag text-puntofit-red w-4"></i>
                    Mis Compras
                </a>
                <button onclick="cerrarSesion()"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                               text-red-600 hover:bg-red-50 transition">
                    <i class="fas fa-sign-out-alt w-4"></i>
                    Cerrar sesión
                </button>
            </div>
        </div>`;

    const saludo = document.getElementById('hero-saludo');
    if (saludo) {
        saludo.textContent = `¡Bienvenido de vuelta, ${nombre}!`;
        saludo.classList.remove('hidden');
    }
}

window.toggleUserMenu = function () {
    document.getElementById('user-dropdown')?.classList.toggle('hidden');
};

window.cerrarSesion = async function () {
    await supabase.auth.signOut();
    window.location.reload();
};

// Botón "Mis Compras" del menú → abre historial de compras
window.handleVerCompras = async function (e) {
    e.preventDefault();
    document.getElementById('user-dropdown')?.classList.add('hidden');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Inicia sesión para ver tus compras.'); return; }

    const { data: pedidos } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id_usuario', session.user.id)
        .order('fecha', { ascending: false })
        .limit(20);

    abrirModalHistorial(pedidos || []);
};

// Alias para compatibilidad
window.handlePaypalCheckout = window.handleVerCompras;


window.abrirModalHistorial = function (pedidos) {
    const existing = document.getElementById('historial-modal');
    if (existing) existing.remove();

    const vacio = `
        <div class="text-center py-10">
            <i class="fas fa-shopping-bag text-4xl text-gray-200 mb-3"></i>
            <p class="text-gray-400 text-sm">Aún no tienes compras registradas.</p>
            <p class="text-gray-300 text-xs mt-1">Usa el botón PayPal del carrito para comprar.</p>
        </div>`;

    const filas = pedidos.length === 0 ? vacio : pedidos.map(p => {
        const items = Array.isArray(p.items) ? p.items : [];
        return `
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-400">
                    ${new Date(p.fecha).toLocaleDateString('es-VE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </span>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        ${p.estado || 'completado'}
                    </span>
                    <span class="font-black text-puntofit-red">$${Number(p.total).toFixed(2)}</span>
                </div>
            </div>
            <ul class="text-xs text-gray-600 space-y-0.5">
                ${items.map(i => `<li>· ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toFixed(2)}</li>`).join('')}
            </ul>
        </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.id = 'historial-modal';
    modal.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/60" onclick="cerrarModalHistorial()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div class="bg-[#003087] px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <p class="text-white font-black text-lg">Mis compras</p>
                    <p class="text-blue-200 text-xs">Historial de pagos con PayPal</p>
                </div>
                <button onclick="cerrarModalHistorial()" class="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div class="overflow-y-auto p-5 space-y-3 flex-1">${filas}</div>
            <div class="px-5 py-4 border-t border-gray-100 shrink-0">
                <p class="text-xs text-gray-400 text-center">
                    <i class="fab fa-paypal text-blue-500 mr-1"></i>
                    ${pedidos.length} compra${pedidos.length !== 1 ? 's' : ''} registrada${pedidos.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window.cerrarModalHistorial = function () {
    document.getElementById('historial-modal')?.remove();
};

window.abrirModalPaypal = function (total) {
    const existing = document.getElementById('paypal-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'paypal-modal';
    modal.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/60" onclick="cerrarModalPaypal()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div class="bg-[#003087] p-5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30" class="h-10 mx-auto" fill="white">
                    <text y="24" font-size="22" font-family="Arial" font-weight="bold">PayPal</text>
                </svg>
            </div>
            <div class="p-6">
                <p class="text-center text-gray-500 text-sm mb-1">Total a pagar</p>
                <p class="text-center text-3xl font-black text-[#003087] mb-5">${total}</p>
                <div class="space-y-3 mb-5">
                    <input type="email" id="pp-email" placeholder="Correo de PayPal"
                           class="w-full px-4 py-3 rounded-xl border border-gray-200
                                  focus:outline-none focus:border-blue-500 text-sm transition">
                    <input type="password" id="pp-pass" placeholder="Contraseña"
                           class="w-full px-4 py-3 rounded-xl border border-gray-200
                                  focus:outline-none focus:border-blue-500 text-sm transition">
                </div>
                <button onclick="simularPagoPaypal()"
                        class="w-full bg-[#FFB700] hover:bg-[#e6a600] text-[#003087]
                               font-bold py-3 rounded-xl transition uppercase tracking-wider">
                    Pagar ahora
                </button>
                <button onclick="cerrarModalPaypal()"
                        class="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition">
                    Cancelar
                </button>
                <p class="text-center text-xs text-gray-400 mt-4">
                    Pago simulado — no se procesará ningún cobro real
                </p>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window.cerrarModalPaypal = function () {
    document.getElementById('paypal-modal')?.remove();
};

window.simularPagoPaypal = async function () {
    const email = document.getElementById('pp-email')?.value;
    const pass  = document.getElementById('pp-pass')?.value;
    if (!email || !pass) {
        alert('Completa el correo y contraseña de PayPal.');
        return;
    }

    // Obtener total y carrito actuales
    const totalText = document.getElementById('cart-total')?.innerText || '$0.00';
    const totalNum  = parseFloat(totalText.replace('$', '')) || 0;
    const itemsCarrito = (typeof cart !== 'undefined' ? cart : []).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
    }));

    cerrarModalPaypal();
    await procesarPagoPaypal(totalNum, itemsCarrito);
};

// Hace la petición asíncrona real a Supabase (guardar el pedido) y recién
// AHÍ decide qué pantalla mostrar — éxito o error dependen del resultado
// real de la petición, nunca de un temporizador fijo.
async function procesarPagoPaypal(totalNum, itemsCarrito) {
    const overlay = document.createElement('div');
    overlay.id = 'paypal-loading';
    overlay.className = 'fixed inset-0 z-[400] flex flex-col items-center justify-center bg-white';
    overlay.innerHTML = `
        <p class="text-4xl font-black text-[#003087] mb-6">PayPal</p>
        <div class="w-10 h-10 border-4 border-[#003087] border-t-[#FFB700]
                    rounded-full animate-spin mb-4"></div>
        <p class="text-[#003087] font-semibold">Procesando pago...</p>`;
    document.body.appendChild(overlay);

    try {
        // Guardar pedido en Supabase (asíncrono)
        const { data: { session } } = await supabase.auth.getSession();

        if (session && itemsCarrito.length > 0) {
            const { error } = await supabase.from('pedidos').insert({
                id_usuario: session.user.id,
                items:      itemsCarrito,
                total:      totalNum,
                estado:     'completado',
                fecha:      new Date().toISOString()
            });

            if (error) throw error;
        }

        overlay.remove();
        mostrarExitoPaypal();
    } catch (err) {
        console.error('[AJAX] Error al guardar el pedido:', err.message || err);
        overlay.remove();
        mostrarErrorPaypal(totalNum, itemsCarrito);
    }
}

window.mostrarExitoPaypal = function () {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center
                        justify-center mx-auto mb-4">
                <i class="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h3 class="text-2xl font-black text-gray-800 mb-2">¡Pago exitoso!</h3>
            <p class="text-gray-500 mb-6">Tu pedido ha sido confirmado. Te contactaremos pronto.</p>
            <button onclick="this.closest('.fixed').remove(); if(typeof cart !== 'undefined'){ cart=[]; saveCart(); updateCartUI(); }"
                    class="w-full bg-puntofit-red hover:bg-red-700 text-white font-bold
                           py-3 rounded-xl transition">
                Aceptar
            </button>
        </div>`;
    document.body.appendChild(modal);
};

// Estado de error: se muestra solo si la petición a Supabase falló de
// verdad (red caída, servidor no disponible, etc.), con opción de reintentar
// la MISMA petición sin perder los datos del pedido.
window.mostrarErrorPaypal = function (totalNum, itemsCarrito) {
    const modal = document.createElement('div');
    modal.id = 'paypal-error-modal';
    modal.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div class="w-20 h-20 bg-red-50 rounded-full flex items-center
                        justify-center mx-auto mb-4">
                <i class="fas fa-times text-4xl text-red-500"></i>
            </div>
            <h3 class="text-2xl font-black text-gray-800 mb-2">No se pudo confirmar el pago</h3>
            <p class="text-gray-500 mb-6">No pudimos conectar con el servidor para registrar tu pedido. Revisá tu conexión e intentá de nuevo.</p>
            <button onclick="reintentarPagoPaypal()"
                    class="w-full bg-puntofit-red hover:bg-red-700 text-white font-bold
                           py-3 rounded-xl transition mb-2">
                Reintentar
            </button>
            <button onclick="document.getElementById('paypal-error-modal').remove()"
                    class="w-full text-sm text-gray-400 hover:text-gray-600 transition">
                Cancelar
            </button>
        </div>`;
    modal.dataset.total = totalNum;
    modal.dataset.items = JSON.stringify(itemsCarrito);
    document.body.appendChild(modal);
};

window.reintentarPagoPaypal = async function () {
    const modal = document.getElementById('paypal-error-modal');
    if (!modal) return;
    const totalNum = parseFloat(modal.dataset.total);
    const itemsCarrito = JSON.parse(modal.dataset.items);
    modal.remove();
    await procesarPagoPaypal(totalNum, itemsCarrito);
};

document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('user-menu-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('user-dropdown')?.classList.add('hidden');
    }
});