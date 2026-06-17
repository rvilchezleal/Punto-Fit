const adminSessionKey = 'puntofit-admin-session';

const adminCredentials = {
    email: 'admin@puntofit.com',
    password: 'admin123'
};

function getAdminSession() {
    try {
        const raw = localStorage.getItem(adminSessionKey) || sessionStorage.getItem(adminSessionKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function isAdminLoggedIn() {
    const session = getAdminSession();
    return Boolean(session && session.role === 'admin');
}

function setAdminSession(email, remember = false) {
    const session = {
        email,
        role: 'admin',
        loggedInAt: Date.now()
    };

    if (remember) {
        localStorage.setItem(adminSessionKey, JSON.stringify(session));
        sessionStorage.removeItem(adminSessionKey);
    } else {
        sessionStorage.setItem(adminSessionKey, JSON.stringify(session));
        localStorage.removeItem(adminSessionKey);
    }
}

function clearAdminSession() {
    localStorage.removeItem(adminSessionKey);
    sessionStorage.removeItem(adminSessionKey);
}

function logoutAdmin() {
    clearAdminSession();
    window.location.href = 'login.html';
}

function requireAdminAuth() {
    if (isAdminLoggedIn()) return true;

    window.location.href = 'login.html?redirect=admin.html';
    return false;
}

function redirectAfterLogin() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    const safeRedirect = redirect && /^[a-z0-9-]+\.html$/i.test(redirect) ? redirect : 'admin.html';
    window.location.href = safeRedirect;
}

function showLoginError(message) {
    const errorEl = document.getElementById('login-error');
    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function initLoginPage() {
    if (isAdminLoggedIn()) {
        redirectAfterLogin();
        return;
    }

    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const remember = form.querySelector('[name="remember"]')?.checked;

        if (
            email === adminCredentials.email.toLowerCase() &&
            password === adminCredentials.password
        ) {
            setAdminSession(email, remember);
            redirectAfterLogin();
            return;
        }

        showLoginError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        initLoginPage();
    }
});
