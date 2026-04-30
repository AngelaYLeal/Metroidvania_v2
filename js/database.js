// Configuración de conexión
const SUPABASE_URL = 'https://wysyfbjvxpwyvexzekxw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jpLKViC0dad4RTwHUC28Ng_uNqaASDW';

// CORRECCIÓN: Usamos 'supabase.createClient' pero lo asignamos a una constante
// que no choque con el nombre de la librería si la cargas vía CDN.
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
    return data; // Devolvemos los datos para que el HTML los maneje
}

async function insertarComentario(nuevoNombre, nuevoMensaje) {
    // Si tienes RLS activado, esto solo funcionará si la política lo permite
    const { error } = await supabaseClient
        .from('comentarios')
        .insert([{ usuario: nuevoNombre, contenido: nuevoMensaje }]);

    if (error) {
        console.error("Error detalle:", error);
        alert("Error de seguridad o de red al publicar.");
    } else {
        alert("¡Transmisión guardada en la red!");
        location.reload(); // Recarga simple para ver el nuevo comentario
    }
}