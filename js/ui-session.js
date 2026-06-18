// js/ui-session.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://elnxlsydfdndolrcdyri.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc'
);

const ADMIN_EMAILS = ['admin@puntofit.com', 'rvilchezleal@gmail.com'];

export async function initSessionUI(isInPagesFolder = false) {
    const base = isInPagesFolder ? '../' : '';
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        renderLoggedOut(base);
        return null;
    }

    const user = session.user;
    const nombre = user.user_metadata?.full_name || user.email.split('@')[0];

    // Consultar rol en tabla usuarios
    const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol, nombre')
        .eq('id', user.id)
        .single();

    const rol = perfil?.rol || 'cliente';
    const esAdmin = rol === 'admin' || ADMIN_EMAILS.includes(user.email);
    const nombreMostrar = perfil?.nombre || nombre;

    renderLoggedIn(nombreMostrar, esAdmin, base);
    return { user, rol, esAdmin, nombre: nombreMostrar };
}

function renderLoggedOut(base) {
    const container = document.getElementById('auth-buttons');
    if (!container) return;
    container.innerHTML = `
        <a href="${base}pages/login.html"
           class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
                  text-gray-700 hover:text-puntofit-red border-2 border-puntofit-red
                  rounded-full transition">
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
                   onclick="handlePaypalCheckout(event)"
                   class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                          hover:bg-red-50 hover:text-puntofit-red transition">
                    <i class="fab fa-paypal text-blue-600 w-4"></i>
                    Pagar con PayPal
                </a>
                <button onclick="cerrarSesion()"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                               text-red-600 hover:bg-red-50 transition">
                    <i class="fas fa-sign-out-alt w-4"></i>
                    Cerrar sesión
                </button>
            </div>
        </div>`;

    // Saludo en el hero si existe
    const saludo = document.getElementById('hero-saludo');
    if (saludo) {
        saludo.textContent = `¡Bienvenido de vuelta, ${nombre}!`;
        saludo.classList.remove('hidden');
    }
}

// Estas funciones se exponen globalmente para los onclick del HTML
window.toggleUserMenu = function () {
    document.getElementById('user-dropdown')?.classList.toggle('hidden');
};

window.cerrarSesion = async function () {
    await supabase.auth.signOut();
    window.location.reload();
};

window.handlePaypalCheckout = function (e) {
    e.preventDefault();
    const total = document.getElementById('cart-total')?.innerText || '$0.00';

    if (total === '$0.00') {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    // Cierra el menú y abre el modal de PayPal simulado
    document.getElementById('user-dropdown')?.classList.add('hidden');
    abrirModalPaypal(total);
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
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                     alt="PayPal" class="h-10 mx-auto rounded">
            </div>
            <div class="p-6">
                <p class="text-center text-gray-500 text-sm mb-1">Total a pagar</p>
                <p class="text-center text-3xl font-black text-[#003087] mb-5">${total}</p>
                <div class="space-y-3 mb-5">
                    <input type="email" id="pp-email" placeholder="Correo de PayPal"
                           class="w-full px-4 py-3 rounded-xl border border-gray-200
                                  focus:outline-none focus:border-[#003087] text-sm transition">
                    <input type="password" id="pp-pass" placeholder="Contraseña"
                           class="w-full px-4 py-3 rounded-xl border border-gray-200
                                  focus:outline-none focus:border-[#003087] text-sm transition">
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
                    🔒 Pago simulado — no se procesará ningún cobro real
                </p>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window.cerrarModalPaypal = function () {
    document.getElementById('paypal-modal')?.remove();
};

window.simularPagoPaypal = function () {
    const email = document.getElementById('pp-email')?.value;
    const pass  = document.getElementById('pp-pass')?.value;

    if (!email || !pass) {
        alert('Completa el correo y contraseña de PayPal.');
        return;
    }

    cerrarModalPaypal();

    // Simula procesamiento
    const overlay = document.createElement('div');
    overlay.id = 'paypal-loading';
    overlay.className = 'fixed inset-0 z-[400] flex flex-col items-center justify-center bg-white';
    overlay.innerHTML = `
        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
             alt="PayPal" class="h-16 mb-6 rounded">
        <div class="w-10 h-10 border-4 border-[#003087] border-t-[#FFB700]
                    rounded-full animate-spin mb-4"></div>
        <p class="text-[#003087] font-semibold">Procesando pago...</p>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
        mostrarExitoPaypal();
    }, 2500);
};

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

// Cierra el menú al hacer clic fuera
document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('user-menu-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('user-dropdown')?.classList.add('hidden');
    }
});