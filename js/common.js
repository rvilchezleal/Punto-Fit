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

    // Cerrar todos los demás dentro del mismo contenedor
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
