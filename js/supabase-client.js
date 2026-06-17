/**
 * Cliente Supabase para Punto Fit (Vanilla JS).
 * Requiere en el HTML, ANTES de este archivo:
 *   1) CDN @supabase/supabase-js
 *   2) js/supabase-config.js
 */

function initSupabaseClient() {
    if (typeof supabase === 'undefined') {
        throw new Error('Falta el SDK de Supabase. Agrega el script CDN antes de supabase-client.js');
    }

    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
        throw new Error('Falta js/supabase-config.js. Copia supabase-config.example.js y completa tus credenciales.');
    }

    if (SUPABASE_URL.includes('TU-PROYECTO') || SUPABASE_ANON_KEY.includes('TU_ANON_KEY')) {
        throw new Error('Configura SUPABASE_URL y SUPABASE_ANON_KEY en js/supabase-config.js');
    }

    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const supabaseClient = initSupabaseClient();
