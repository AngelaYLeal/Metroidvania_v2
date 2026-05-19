// js/comments.js

let currentUser = null;

// Diccionario de imágenes de insignias
const BADGE_IMAGES = {
    "Soldado Raso": "assets/img/badges/soldado.png",
    "Hacker de Élite": "assets/img/badges/hacker.png",
    "Einherjar Supremo": "assets/img/badges/supremo.png",
    "Explorador de Datos": "assets/img/badges/explorador.png",
    "Comandante de Flota": "assets/img/badges/comandante.png",
    "Apoyo Altruista": "assets/img/badges/apoyo.png"
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        currentUser = await checkSession();
    } catch (error) {
        console.error("Error de sincronización con el servidor:", error);
        currentUser = null;
    }

    gestionarInterfazUsuario();
    await cargarComentarios();
    inicializarEventosComentarios();
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

function inicializarEventosComentarios() {
    // Evento para el botón principal de transmitir
    const btnTransmitir = document.getElementById('btn-transmitir-principal');
    if (btnTransmitir) {
        btnTransmitir.addEventListener('click', publicarComentario);
    }

    // DELEGACIÓN DE EVENTOS: Al renderizar comentarios dinámicamente,
    // escuchamos los clics desde el contenedor padre seguro '#comments-list'.
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        commentsList.addEventListener('click', async (e) => {

            // Caso 1: Botón de desplegar formulario de respuesta ("Responder")
            const replyToggleBtn = e.target.closest('.btn-toggle-reply');
            if (replyToggleBtn) {
                const commentId = replyToggleBtn.getAttribute('data-id');
                toggleReplyForm(commentId);
                return;
            }

            // Caso 2: Botón para cancelar formulario de respuesta
            const cancelReplyBtn = e.target.closest('.btn-cancel-reply');
            if (cancelReplyBtn) {
                const commentId = cancelReplyBtn.getAttribute('data-id');
                toggleReplyForm(commentId);
                return;
            }

            // Caso 3: Botón para enviar una respuesta asíncrona
            const submitReplyBtn = e.target.closest('.btn-submit-reply');
            if (submitReplyBtn) {
                const commentId = submitReplyBtn.getAttribute('data-id');
                await enviarRespuesta(commentId);
                return;
            }
        });
    }
}

// --- LÓGICA DE INSIGNIAS ---
async function renderBadgesHTML(userId) {
    if (!userId) return '';

    try {
        const [perfilRes, donacionRes] = await Promise.all([
            supabaseClient.from('perfiles').select('categoria').eq('id', userId).single(),
            supabaseClient.from('donations').select('tier_name').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
        ]);

        const categoria = perfilRes.data?.categoria || 'usuario';
        const tier = (donacionRes.data && donacionRes.data.length > 0) ? donacionRes.data[0].tier_name : null;

        let html = '';

        // 1. Badge de Desarrollador (Rojo Neón)
        if (categoria === 'developer') {
            html += `
        <span class="badge bg-danger border border-light shadow-neon-red me-1" style="font-size: 0.6rem;">
            <i class="fa-solid fa-code me-1"></i>DEV
        </span>`;
        }

        // 2. Badge de Contribuidor
        if (tier) {
            const imgSrc = BADGE_IMAGES[tier] || "assets/img/logos/Logo_sin_fondo.png";
            html += `
        <span class="badge border border-info text-info me-1 bg-black" style="font-size: 0.6rem;">
            <img src="${imgSrc}" style="width:12px; margin-right:4px; vertical-align: middle;"> ${tier}
        </span>`;
        }

        // 3. Badge de Infiltrado
        if (categoria === 'usuario' && !tier) {
            html += `
        <span class="badge border border-secondary text-secondary opacity-75" style="font-size: 0.55rem;">
            <i class="fa-solid fa-user-secret me-1"></i>Infiltrado
        </span>`;
        }

        return html;
    } catch (err) {
        console.error("Error renderizando insignias:", err);
        return '';
    }
}

// --- FUNCIÓN GENERAR HTML DE COMENTARIO ---
async function generarHTMLComentario(comentario, todosLosComentarios, nivel = 0) {
    const fecha = new Date(comentario.created_at).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    const fotoUrl = comentario.perfiles?.avatar_url || 'assets/img/logos/Logo_sin_fondo.png';
    const badgeHTML = await renderBadgesHTML(comentario.usuario_id);

    const hijos = todosLosComentarios.filter(c => c.parent_id === comentario.id);
    hijos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const indentClass = nivel > 0 ? 'ms-4 ms-md-5 border-start border-info ps-3 mt-3' : 'mb-4';
    const cardClass = 'bg-dark border-secondary';

    const hijosHTMLArray = await Promise.all(hijos.map(hijo => generarHTMLComentario(hijo, todosLosComentarios, nivel + 1)));
    const hijosHTML = hijosHTMLArray.join('');

    const perfilLink = `view-profile.html?id=${comentario.usuario_id}`;

    return `
    <div class="${indentClass}" id="comment-${comentario.id}">
        <div class="card ${cardClass} shadow-sm">
            <div class="card-header border-secondary d-flex justify-content-between align-items-center bg-black py-1">
                <a href="${perfilLink}" class="text-decoration-none d-flex align-items-center flex-wrap user-profile-trigger">
                    <img src="${fotoUrl}" class="rounded-circle border border-info me-2"
                         style="width: ${nivel === 0 ? '30px' : '22px'}; height: ${nivel === 0 ? '30px' : '22px'};">
                    <strong class="text-white small hover-cyan" style="font-size: 0.8rem;">${comentario.usuario}</strong>
                </a>
                <div class="ms-1 d-inline-flex align-items-center">
                    ${badgeHTML}
                    <span class="text-secondary ms-2" style="font-size: 0.65rem;">${fecha}</span>
                </div>
            </div>
            <div class="card-body p-3">
                <p class="card-text text-light mb-2" style="white-space: pre-wrap; font-size: 0.9rem;">${comentario.contenido}</p>

                ${currentUser ? `
                    <button class="btn btn-link btn-sm text-info p-0 text-decoration-none shadow-none btn-toggle-reply" style="font-size: 0.75rem;" data-id="${comentario.id}">
                        <i class="fa-solid fa-reply me-1"></i>Responder
                    </button>

                    <!-- FORMULARIO DE RESPUESTA (OCULTO POR DEFECTO) -->
                    <div id="reply-form-${comentario.id}" class="d-none mt-3">
                        <textarea id="reply-input-${comentario.id}" class="form-control bg-black text-white border-secondary mb-2" rows="2" placeholder="Escribe tu respuesta..."></textarea>
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-outline-secondary btn-sm btn-cancel-reply" data-id="${comentario.id}">Cancelar</button>
                            <button class="btn btn-info btn-sm text-dark fw-bold btn-submit-reply" data-id="${comentario.id}">Responder</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="replies-container">
            ${hijosHTML}
        </div>
    </div>
  `;
}

async function cargarComentarios() {
    const listaHTML = document.getElementById('comments-list');
    if (!listaHTML) return;

    const { data, error } = await supabaseClient
        .from('comentarios')
        .select(`
        id, usuario, contenido, created_at, parent_id, usuario_id,
        perfiles (avatar_url)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error al descargar transmisiones:", error);
        return;
    }

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
    const btn = document.querySelector('#comment-form-container button');

    if (!mensaje) return;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Transmitiendo...';
    }

    try {
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('username')
            .eq('id', currentUser.id)
            .single();

        const { error } = await supabaseClient
            .from('comentarios')
            .insert([{
                usuario: perfil?.username || "Einherjar",
                contenido: mensaje,
                usuario_id: currentUser.id
            }]);

        if (error) throw error;
        mensajeInput.value = '';
        await cargarComentarios();
    } catch (error) {
        alert("Error al enviar la transmisión: " + error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Transmitir';
        }
    }
}

function toggleReplyForm(id) {
    const form = document.getElementById(`reply-form-${id}`);
    if (form) form.classList.toggle('d-none');
}

async function enviarRespuesta(parentId) {
    const input = document.getElementById(`reply-input-${parentId}`);
    if (!input) return;

    const mensaje = input.value.trim();
    if (!mensaje) return;

    const btn = document.querySelector(`#reply-form-${parentId} .btn-submit-reply`);
    if (btn) btn.disabled = true;

    try {
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('username')
            .eq('id', currentUser.id)
            .single();

        const { error } = await supabaseClient
            .from('comentarios')
            .insert([{
                usuario: perfil?.username || "Einherjar",
                contenido: mensaje,
                usuario_id: currentUser.id,
                parent_id: parentId
            }]);

        if (error) throw error;
        await cargarComentarios();
    } catch (error) {
        alert("Error al responder en la red: " + error.message);
        if (btn) btn.disabled = false;
    }
}