// js/comments.js

let currentUser = null;

const BADGE_IMAGES = {
    "Soldado Raso": "assets/img/badges/soldado.png",
    "Hacker de Élite": "assets/img/badges/hacker.png",
    "Einherjar Supremo": "assets/img/badges/supremo.png",
    "Explorador de Datos": "assets/img/badges/explorador.png",
    "Comandante de Flota": "assets/img/badges/comandante.png",
    "Apoyo Altruista": "assets/img/badges/apoyo.png"
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // checkSession() viene de pouchDB.js
        currentUser = await checkSession();
    } catch(e) {
        console.warn("No hay sesión activa en el búnker local.");
    }
    gestionarInterfazUsuario();
    await cargarComentariosWeb();
});

function gestionarInterfazUsuario() {
    const actionsNav = document.getElementById('nav-user-actions');
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');

    if (currentUser) {
        if (formContainer) formContainer.classList.remove('d-none');
        if (loginPrompt) loginPrompt.classList.add('d-none');
        if (actionsNav) {
            actionsNav.innerHTML = `
                <a href="profile.html" class="btn btn-outline-info btn-sm">
                    <i class="fa-solid fa-user me-1"></i> Mi Terminal
                </a>
            `;
        }
    } else {
        if (formContainer) formContainer.classList.add('d-none');
        if (loginPrompt) loginPrompt.classList.remove('d-none');
    }
}

// SOLUCIÓN AL BUG DE INSIGNIAS: Buscamos por Nombre de Usuario si no hay UUID
async function renderBadgesHTML(usernameOrId) {
    if (!usernameOrId) return '';
    try {
        let status = null;

        // 1. Si es un UUID (contiene guiones o es largo) buscamos directo por ID
        if (usernameOrId.includes('-') || usernameOrId.length > 20) {
            status = await getUserFullStatus(usernameOrId);
        } else {
            // 2. Si viene de los datos semilla iniciales, es un nombre plano (ej: "Angela").
            // Buscamos en dbPerfiles el documento que tenga ese "username".
            const resultPerfiles = await dbPerfiles.allDocs({ include_docs: true });
            const perfilEncontrado = resultPerfiles.rows.find(row =>
                row.doc.username && row.doc.username.toLowerCase() === usernameOrId.toLowerCase()
            );

            if (perfilEncontrado) {
                status = await getUserFullStatus(perfilEncontrado.doc._id);
            }
        }

        if (!status) {
            return `<span class="badge border border-secondary text-secondary opacity-75" style="font-size: 0.55rem;"><i class="fa-solid fa-user-secret me-1"></i>Infiltrado</span>`;
        }

        let html = '';
        if (status.categoria === 'developer') {
            html += `<span class="badge bg-danger border border-light shadow-neon-red me-1" style="font-size: 0.6rem;"><i class="fa-solid fa-code me-1"></i>DEV</span>`;
        }
        if (status.tier) {
            const imgSrc = BADGE_IMAGES[status.tier] || "assets/img/logos/Logo_sin_fondo.png";
            html += `<span class="badge border border-info text-info me-1 bg-black" style="font-size: 0.6rem;">
                        <img src="${imgSrc}" style="width:12px; margin-right:4px; vertical-align: middle;"> ${status.tier}
                     </span>`;
        }
        if (status.categoria === 'usuario' && !status.tier) {
            html += `<span class="badge border border-secondary text-secondary opacity-75" style="font-size: 0.55rem;"><i class="fa-solid fa-user-secret me-1"></i>Infiltrado</span>`;
        }
        return html;
    } catch (err) {
        console.error("Error obteniendo insignias de red:", err);
        return '';
    }
}

async function generarHTMLComentario(comentario, todosLosComentarios, nivel = 0) {
    const fecha = new Date(comentario.created_at).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const fotoUrl = 'assets/img/logos/Logo_sin_fondo.png';

    // Mapeo adaptivo de autoría
    const autorIdentificador = comentario.usuario_id || comentario.usuario;
    const badgeHTML = await renderBadgesHTML(autorIdentificador);
    const idComentario = comentario._id || comentario.id;

    // --- NUEVA LÓGICA DE ENLACE DINÁMICO AL PERFIL PÚBLICO ---
    let usernameHTML = `<strong class="text-white small" style="font-size: 0.8rem;">${comentario.usuario}</strong>`;

    try {
        let perfilEncontrado = null;

        // Si el comentario trae UUID, buscamos por ID directo
        if (comentario.usuario_id && (comentario.usuario_id.includes('-') || comentario.usuario_id.length > 20)) {
            perfilEncontrado = await dbPerfiles.get(comentario.usuario_id.toString()).catch(() => null);
        } else {
            // Si es un nombre plano (datos semilla), buscamos por coincidencia de username
            const resultPerfiles = await dbPerfiles.allDocs({ include_docs: true });
            const encontrado = resultPerfiles.rows.find(row =>
                row.doc.username && row.doc.username.toLowerCase() === comentario.usuario.toLowerCase()
            );
            if (encontrado) perfilEncontrado = encontrado.doc;
        }

        // Si el perfil existe en PouchDB, lo convertimos en un enlace clickable con estilo Cyberpunk
        if (perfilEncontrado) {
            usernameHTML = `
                <a href="view-profile.html?id=${perfilEncontrado._id}" 
                   class="text-decoration-none small fw-bold text-info user-profile-link" 
                   style="font-size: 0.8rem;" 
                   title="Acceder al Registro del Operador">
                   ${comentario.usuario}
                </a>`;
        }
    } catch (err) {
        console.warn("No se pudo vincular el perfil para el usuario:", comentario.usuario);
    }
    // --------------------------------------------------------

    const hijos = todosLosComentarios.filter(c => c.parent_id === idComentario);
    const indentClass = nivel > 0 ? 'ms-4 ms-md-5 border-start border-info ps-3 mt-3' : 'mb-4';

    const hijosHTMLArray = await Promise.all(hijos.map(hijo => generarHTMLComentario(hijo, todosLosComentarios, nivel + 1)));

    return `
    <div class="${indentClass}" id="comment-${idComentario}">
        <div class="card bg-dark border-secondary shadow-sm">
            <div class="card-header border-secondary d-flex justify-content-between align-items-center bg-black py-1">
                <div class="d-flex align-items-center flex-wrap">
                    <img src="${fotoUrl}" class="rounded-circle border border-info me-2" style="width: 22px; height: 22px;">
                    ${usernameHTML}
                </div>
                <div class="ms-1 d-inline-flex align-items-center">
                    ${badgeHTML}
                    <span class="text-secondary ms-2" style="font-size: 0.65rem;">${fecha}</span>
                </div>
            </div>
            <div class="card-body p-3">
                <p class="card-text text-light mb-2" style="white-space: pre-wrap; font-size: 0.9rem;">${comentario.contenido}</p>
                ${currentUser ? `
                    <button class="btn btn-link btn-sm text-info p-0 text-decoration-none" style="font-size: 0.75rem;" onclick="toggleReplyForm('${idComentario}')">
                        <i class="fa-solid fa-reply me-1"></i>Responder
                    </button>
                    <div id="reply-form-${idComentario}" class="d-none mt-3">
                        <textarea id="reply-input-${idComentario}" class="form-control bg-black text-white border-secondary mb-2" rows="2" placeholder="Escribe tu respuesta..."></textarea>
                        <div class="d-flex justify-content-end gap-2">
                            <button onclick="enviarRespuesta('${idComentario}')" class="btn btn-info btn-sm text-dark fw-bold">Responder</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="replies-container">${hijosHTMLArray.join('')}</div>
    </div>`;
}

async function cargarComentariosWeb() {
    const listaHTML = document.getElementById('comments-list');
    if (!listaHTML) return;

    const data = await cargarComentarios();

    if (!data || data.length === 0) {
        listaHTML.innerHTML = `<div class="text-center text-secondary py-4">No hay transmisiones archivadas.</div>`;
        return;
    }

    const raices = data.filter(c => !c.parent_id);
    const listaCompletaHTML = await Promise.all(raices.map(comentario => generarHTMLComentario(comentario, data)));
    listaHTML.innerHTML = listaCompletaHTML.join('');
}

async function publicarComentario() {
    const mensajeInput = document.getElementById('comentario-input');
    if (!mensajeInput) return;

    const mensaje = mensajeInput.value.trim();
    if (!mensaje) return;

    try {
        const autorNombre = currentUser ? (currentUser.username || "Einherjar") : "Anónimo";
        await insertarComentario(autorNombre, mensaje);

        mensajeInput.value = '';
        location.reload();
    } catch (err) {
        console.error("Error al publicar la transmisión:", err);
    }
}

function toggleReplyForm(id) {
    const formulario = document.getElementById(`reply-form-${id}`);
    if (formulario) formulario.classList.toggle('d-none');
}

async function enviarRespuesta(parentId) {
    const input = document.getElementById(`reply-input-${parentId}`);
    if (!input) return;

    const mensaje = input.value.trim();
    if (!mensaje) return;

    const nuevoDoc = {
        _id: 'comentario_hijo_' + new Date().getTime().toString(),
        usuario: currentUser ? (currentUser.username || "Einherjar") : "Anónimo",
        contenido: mensaje,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        usuario_id: currentUser ? currentUser.id : null
    };

    try {
        await dbComentarios.put(nuevoDoc);
        location.reload();
    } catch (err) {
        console.error("Error al incrustar respuesta local:", err);
    }
}