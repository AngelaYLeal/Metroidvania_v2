// --- CONFIGURACIÓN DE POUCHDB ---
const dbComentarios = new PouchDB('comentarios_local');
const dbPerfiles = new PouchDB('perfiles_local');
const dbDonaciones = new PouchDB('donaciones_local');



async function checkSession() {
    const user = JSON.parse(localStorage.getItem('session_user'));
    return user || null;
}

async function logout() {
    localStorage.removeItem('session_user');
    window.location.href = 'log_in.html';
}

// --- FUNCIONES DE BASE DE DATOS (COMENTARIOS) ---

async function cargarComentarios() {
    try {
        const result = await dbComentarios.allDocs({ include_docs: true, descending: true });
        // Mapeamos para mantener compatibilidad con tu código actual
        return result.rows.map(row => ({
            id: row.doc._id,
            usuario: row.doc.usuario,
            contenido: row.doc.contenido,
            created_at: row.doc.created_at
        }));
    } catch (err) {
        console.error("Error al cargar comentarios locales:", err);
        return [];
    }
}

async function insertarComentario(nuevoNombre, nuevoMensaje) {
    const nuevoDoc = {
        _id: new Date().getTime().toString(),
        usuario: nuevoNombre,
        contenido: nuevoMensaje,
        created_at: new Date().toISOString()
    };

    try {
        await dbComentarios.put(nuevoDoc);
        alert("¡Transmisión guardada en el búnker local!");
        location.reload();
    } catch (err) {
        console.error("Error al guardar comentario:", err);
        alert("Fallo en la memoria local del búnker.");
    }
}

// --- FUNCIONES DE RANGO Y ESTADO ---

async function getUserFullStatus(userId) {
    if (!userId) return null;

    try {
        // 1. Obtener perfil
        const perfil = await dbPerfiles.get(userId.toString()).catch(() => null);

        // 2. Obtener donaciones del usuario
        const resultDonaciones = await dbDonaciones.allDocs({ include_docs: true });
        const listaDonaciones = resultDonaciones.rows
            .map(r => r.doc)
            .filter(d => d.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return {
            categoria: perfil?.categoria || 'usuario',
            tier: (listaDonaciones.length > 0) ? listaDonaciones[0].tier_name : null,
            username: perfil?.username || 'Sujeto Anónimo'
        };
    } catch (err) {
        console.error("Error al obtener estado de usuario:", err);
        return { categoria: 'usuario', tier: null, username: 'Error de Red Local' };
    }
}

// --- PROTOCOLO DE INICIALIZACIÓN (Para el Profesor) ---
// Esta función carga los datos de initial_data.js si la DB está vacía
async function inicializarBunker() {
    try {
        const infoCom = await dbComentarios.info();
        const infoPer = await dbPerfiles.info();
        const infoDon = await dbDonaciones.info();

        // Si falta alguno de los bloques principales, inyectamos la semilla
        if (infoCom.doc_count === 0 || infoPer.doc_count === 0 || infoDon.doc_count === 0) {
            console.log("Sistema vacío. Inyectando registros históricos...");

            // Usamos las constantes definidas en initial_data.js
            if (typeof INITIAL_COMMENTS !== 'undefined') await dbComentarios.bulkDocs(INITIAL_COMMENTS);
            if (typeof INITIAL_PROFILES !== 'undefined') await dbPerfiles.bulkDocs(INITIAL_PROFILES);
            if (typeof INITIAL_DONATIONS !== 'undefined') await dbDonaciones.bulkDocs(INITIAL_DONATIONS);

            console.log("✅ Datos de respaldo cargados. Reiniciando sistemas...");
            setTimeout(() => location.reload(), 500);
        } else {
            console.log("%c ACCESO AL BÚNKER CONCEDIDO ", "color: #00ffff; background: #000; font-weight: bold; border: 1px solid #00ffff; padding: 5px;");
        }
    } catch (err) {
        console.error("Error en el protocolo de inicialización:", err);
    }
}

// Ejecutar al cargar el script
inicializarBunker();