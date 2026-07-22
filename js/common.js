const darkModeKey = 'puntofit-dark-mode';

function setThemeIcon(isDarkMode) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;

    themeIcon.classList.toggle('fa-moon', !isDarkMode);
    themeIcon.classList.toggle('fa-sun', isDarkMode);
}

function applyDarkMode(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    setThemeIcon(isDarkMode);
}

function toggleDarkMode() {
    const isDarkMode = !document.body.classList.contains('dark-mode');
    applyDarkMode(isDarkMode);
    localStorage.setItem(darkModeKey, String(isDarkMode));
}

function initDarkMode() {
    const savedDarkMode = localStorage.getItem(darkModeKey) === 'true';
    applyDarkMode(savedDarkMode);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu || !icon) return;

    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    icon.classList.toggle('fa-bars', isOpen);
    icon.classList.toggle('fa-times', !isOpen);
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu || !icon) return;

    menu.classList.add('hidden');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
}

document.addEventListener('DOMContentLoaded', initDarkMode);

// ── MODAL FAQ (disponible en todas las páginas cliente) ──
function abrirModalFAQ() {
    const modal = document.getElementById('faq-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalFAQ() {
    const modal = document.getElementById('faq-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

window.abrirModalFAQ  = abrirModalFAQ;
window.cerrarModalFAQ = cerrarModalFAQ;

// ── ACORDEÓN FAQ ─────────────────────────────────────────
function toggleFaq(button) {
    const item = button.closest('.faq-item');
    if (!item) return;
    const answer = item.querySelector('.faq-answer');
    const icon   = button.querySelector('.faq-icon');
    const isOpening = answer.classList.contains('hidden');

    const container = item.closest('.faq-accordion') || document;
    container.querySelectorAll('.faq-item').forEach(other => {
        if (other === item) return;
        other.querySelector('.faq-answer')?.classList.add('hidden');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-icon')?.classList.remove('rotate-180');
        other.classList.remove('faq-item--open');
    });

    answer.classList.toggle('hidden');
    button.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
    icon?.classList.toggle('rotate-180', isOpening);
    item.classList.toggle('faq-item--open', isOpening);
}

window.toggleFaq = toggleFaq;

// ── MODAL CONTACTO ───────────────────────────────────────
function openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ── MODAL UBICACIÓN ───────────────────────────────────────
function openLocationModal() {
    const modal = document.getElementById('location-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ── SCROLL REVEAL ─────────────────────────────────────────
// Revela con fade+slide los elementos .reveal-on-scroll al entrar en viewport.
// Re-invocable de forma segura: solo observa nodos que aún no fueron marcados.
let scrollRevealObserver = null;

function initScrollReveal(root = document) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
        return;
    }

    if (!scrollRevealObserver) {
        scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    scrollRevealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
    }

    root.querySelectorAll('.reveal-on-scroll:not(.reveal-observed)').forEach((el, i) => {
        el.classList.add('reveal-observed');
        el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
        scrollRevealObserver.observe(el);
    });
}

window.initScrollReveal = initScrollReveal;

// ── ESTADOS DE CARGA DEL CATÁLOGO (fetch asíncrono a Supabase) ──
function renderSkeletonCards(count) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-card rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div class="skeleton-block h-64"></div>
            <div class="p-6 space-y-3">
                <div class="skeleton-block h-3 w-1/3 rounded"></div>
                <div class="skeleton-block h-5 w-2/3 rounded"></div>
                <div class="skeleton-block h-6 w-1/4 rounded"></div>
            </div>
        </div>
    `).join('');
}

function renderCatalogErrorState(retryFnName, args = '') {
    return `
        <div class="col-span-full text-center py-16">
            <i class="fas fa-wifi text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 font-semibold">No pudimos cargar el catálogo.</p>
            <p class="text-gray-400 text-sm mt-1 mb-4">Revisá tu conexión a internet e intentá de nuevo.</p>
            <button type="button" onclick="${retryFnName}(${args})" class="font-display bg-puntofit-red hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
                Reintentar
            </button>
        </div>
    `;
}

window.renderSkeletonCards = renderSkeletonCards;
window.renderCatalogErrorState = renderCatalogErrorState;
