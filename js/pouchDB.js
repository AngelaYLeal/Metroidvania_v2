// js/pouchDB.js

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

async function cargarComentarios() {
    try {
        const result = await dbComentarios.allDocs({ include_docs: true });
        return result.rows.map(row => ({
            _id: row.doc._id,
            id: row.doc._id,
            usuario: row.doc.usuario,
            contenido: row.doc.contenido,
            created_at: row.doc.created_at,
            parent_id: row.doc.parent_id || null,
            usuario_id: row.doc.usuario_id || null
        }));
    } catch (err) {
        console.error("Error al cargar comentarios locales:", err);
        return [];
    }
}

async function insertarComentario(nuevoNombre, nuevoMensaje) {
    const sesion = await checkSession();
    const nuevoDoc = {
        _id: 'comentario_' + new Date().getTime().toString(),
        usuario: nuevoNombre,
        contenido: nuevoMensaje,
        created_at: new Date().toISOString(),
        parent_id: null,
        usuario_id: sesion ? sesion.id : null
    };
    try {
        await dbComentarios.put(nuevoDoc);
        alert("¡Transmisión guardada en el búnker local!");
    } catch (err) {
        console.error("Error al guardar comentario:", err);
    }
}

async function getUserFullStatus(userId) {
    if (!userId) return null;
    try {
        const idString = userId.toString();
        const perfil = await dbPerfiles.get(idString).catch(() => null);
        const resultDonaciones = await dbDonaciones.allDocs({ include_docs: true });
        const listaDonaciones = resultDonaciones.rows
            .map(r => r.doc)
            .filter(d => d.user_id === idString)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return {
            categoria: perfil?.categoria || 'usuario',
            tier: (listaDonaciones.length > 0) ? listaDonaciones[0].tier_name : null,
            username: perfil?.username || 'Sujeto Anónimo'
        };
    } catch (err) {
        console.error("Error al obtener estado de usuario:", err);
        return { categoria: 'usuario', tier: null, username: 'Desconectado' };
    }
}

async function inicializarBunker() {
    try {
        const infoCom = await dbComentarios.info();
        const infoPer = await dbPerfiles.info();
        const infoDon = await dbDonaciones.info();

        if (infoCom.doc_count === 0 || infoPer.doc_count === 0 || infoDon.doc_count === 0) {
            console.log("Inyectando registros históricos...");

            if (typeof INITIAL_COMMENTS !== 'undefined') await dbComentarios.bulkDocs(INITIAL_COMMENTS);

            // MAPEO PARA ASIGNAR CONTRASEÑAS DINÁMICAS (Nombre + 123 en minúsculas)
            if (typeof INITIAL_PROFILES !== 'undefined') {
                const perfilesConPassword = INITIAL_PROFILES.map(perfil => ({
                    ...perfil,
                    password: perfil.username.trim().toLowerCase() + "123"
                }));
                await dbPerfiles.bulkDocs(perfilesConPassword);
            }

            if (typeof INITIAL_DONATIONS !== 'undefined') await dbDonaciones.bulkDocs(INITIAL_DONATIONS);

            console.log("✅ Datos base cargados sin correos. Reiniciando búnker...");
            setTimeout(() => location.reload(), 500);
        } else {
            console.log("%c ACCESO AL BÚNKER CONCEDIDO ", "color: #00ffff; background: #000; font-weight: bold; border: 1px solid #00ffff; padding: 5px;");
        }
    } catch (err) {
        console.error("Error en el protocolo de inicialización:", err);
    }
}

inicializarBunker();