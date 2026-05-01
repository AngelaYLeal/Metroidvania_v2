// Configuración de conexión
const SUPABASE_URL = 'https://wysyfbjvxpwyvexzekxw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jpLKViC0dad4RTwHUC28Ng_uNqaASDW';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FUNCIONES DE AUTENTICACIÓN ---

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session ? session.user : null;
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'log_in.html';
}

// --- FUNCIONES DE BASE DE DATOS (SQL) ---

async function cargarComentarios() {
    const { data, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error al obtener datos:", error);
        return [];
    }
    return data;
}

async function insertarComentario(nuevoNombre, nuevoMensaje) {
    const { error } = await supabaseClient
        .from('comentarios')
        .insert([{ usuario: nuevoNombre, contenido: nuevoMensaje }]);

    if (error) {
        console.error("Error detalle:", error);
        alert("Error de seguridad o de red al publicar.");
    } else {
        alert("¡Transmisión guardada en la red!");
        location.reload();
    }
}