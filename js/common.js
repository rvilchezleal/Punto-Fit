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
