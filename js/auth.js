// js/auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://elnxlsydfdndolrcdyri.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc'
);

// ── LOGIN ──────────────────────────────────────────────
 export async function handleLogin(e) {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.querySelector('#login-form button[type="submit"]');

    btn.disabled    = true;
    btn.textContent = 'Ingresando...';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showError('login-error', traducirError(error.message));
        btn.disabled    = false;
        btn.textContent = 'Entrar';
        return;
    }

    // Login exitoso → redirige al inicio
    window.location.href = '../index.html';
}

// ── REGISTRO ───────────────────────────────────────────
export async function handleRegistro(e) {
    e.preventDefault();

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm-password').value;
    const btn      = document.querySelector('#registro-form button[type="submit"]');

    if (password !== confirm) {
        showError('registro-error', 'Las contraseñas no coinciden.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Registrando...';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });

    if (error) {
        showError('registro-error', traducirError(error.message));
        btn.disabled    = false;
        btn.textContent = 'Registrarme';
        return;
    }

    alert('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.');
    window.location.href = 'login.html';
}

// ── CERRAR SESIÓN ──────────────────────────────────────
export async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
}

// ── VERIFICAR SESIÓN ACTIVA ────────────────────────────
export async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// ── HELPERS ────────────────────────────────────────────
export function showError(elementId, message) {
    let el = document.getElementById(elementId);
    if (!el) {
        el = document.createElement('p');
        el.id = elementId;
        el.className = 'text-red-600 text-sm mt-2 text-center';
        document.querySelector('form').appendChild(el);
    }
    el.textContent = message;
}

export function traducirError(msg) {
    const errores = {
        'Invalid login credentials':      'Correo o contraseña incorrectos.',
        'Email not confirmed':            'Debes confirmar tu correo antes de entrar.',
        'User already registered':        'Este correo ya está registrado.',
        'Password should be at least 6':  'La contraseña debe tener al menos 6 caracteres.',
        'Unable to validate email':       'El correo no es válido.',
    };
    for (const [key, val] of Object.entries(errores)) {
        if (msg.includes(key)) return val;
    }
    return 'Ocurrió un error. Intenta de nuevo.';
}