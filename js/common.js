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

document.addEventListener('DOMContentLoaded', initDarkMode);
