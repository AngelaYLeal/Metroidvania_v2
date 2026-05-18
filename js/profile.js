// js/profile.js

let userSession = null;

// Diccionario local de imágenes de insignias
const BADGE_IMAGES = {
    "Soldado Raso": "assets/img/badges/soldado.png",
    "Hacker de Élite": "assets/img/badges/hacker.png",
    "Einherjar Supremo": "assets/img/badges/supremo.png",
    "Explorador de Datos": "assets/img/badges/explorador.png",
    "Comandante de Flota": "assets/img/badges/comandante.png",
    "Apoyo Altruista": "assets/img/badges/apoyo.png"
};

// Control de arranque con defer asegurado
document.addEventListener('DOMContentLoaded', async () => {
    // Breve pausa para asegurar que PouchDB levantó las colecciones
    setTimeout(async () => {
        // checkSession() viene de pouchDB.js
        userSession = await checkSession();

        if (!userSession) {
            window.location.href = 'log_in.html';
            return;
        }

        // Ejecutamos ambas cargas desde PouchDB local
        await cargarDatosPerfil();
        await cargarHistorialDonaciones();
    }, 100);
});

// --- LÓGICA DE PERFIL LOCAL (PouchDB) ---

async function cargarDatosPerfil() {
    try {
        const idString = userSession.id.toString();

        // Consultamos el documento del perfil de usuario en dbPerfiles
        const perfil = await dbPerfiles.get(idString).catch(() => null);

        // Consultamos el estado cruzado (categorías y tiers de donación)
        const status = await getUserFullStatus(idString);

        if (perfil) {
            document.getElementById('edit-username').value = perfil.username || "";
            document.getElementById('profile-uid').innerText = "ID: " + idString;

            const avatarImg = document.getElementById('profile-avatar');
            if (perfil.avatar_url && avatarImg) {
                avatarImg.src = perfil.avatar_url;
            }

            // --- SISTEMA DE CATEGORÍAS Y BANNERS VISUALES ---
            const infoCol = document.querySelector('.col-md-8');
            let bannerHTML = '';
            let borderColor = '#6c757d';

            if (status.categoria === 'developer') {
                borderColor = '#dc3545'; // Rojo neón DEV
                bannerHTML = `
                    <div id="rango-banner" class="alert bg-black border text-white text-center mb-4" style="border-color: #dc3545 !important;">
                        <h4 class="font-original mb-0"><i class="fa-solid fa-terminal me-2 text-danger"></i>ACCESO DE ARQUITECTO</h4>
                    </div>`;
            } else if (status.tier) {
                borderColor = '#0dcaf0'; // Cyan neón Mecenas
                bannerHTML = `
                    <div id="rango-banner" class="alert bg-black border shadow-neon-cyan text-white text-center mb-4" style="border-color: #0dcaf0 !important;">
                        <h4 class="font-original mb-0"><i class="fa-solid fa-microchip me-2 text-info"></i>UNIDAD DE APOYO: ${status.tier.toUpperCase()}</h4>
                    </div>`;
            } else {
                bannerHTML = `
                    <div id="rango-banner" class="alert bg-black border text-center text-white mb-4 opacity-75">
                        <h4 class="text-secondary font-original mb-0"><i class="fa-solid fa-user-secret me-2"></i>SUJETO: INFILTRADO</h4>
                    </div>`;
            }

            const existingBanner = document.getElementById('rango-banner');
            if (existingBanner) existingBanner.remove();

            if (infoCol) infoCol.insertAdjacentHTML('afterbegin', bannerHTML);
            if (avatarImg) avatarImg.style.border = `3px solid ${borderColor}`;
        }
    } catch (err) {
        console.error("Error al cargar la terminal de perfil local:", err);
    }
}

async function actualizarNombre() {
    const nuevoNombre = document.getElementById('edit-username').value.trim();
    if (!nuevoNombre) return alert("El nombre es vital para el sistema.");

    try {
        const idString = userSession.id.toString();
        const userDoc = await dbPerfiles.get(idString);

        userDoc.username = nuevoNombre;
        await dbPerfiles.put(userDoc);

        // Sincronizamos la sesión activa en el navegador
        userSession.username = nuevoNombre;
        localStorage.setItem('session_user', JSON.stringify(userSession));

        alert("Identidad local actualizada.");
        location.reload();
    } catch (error) {
        alert("Error de escritura en memoria: " + error.message);
    }
}

async function actualizarPassword() {
    const nuevaPass = document.getElementById('edit-password').value;
    if (nuevaPass.length < 6) return alert("Seguridad insuficiente. Mínimo 6 caracteres.");

    try {
        const idString = userSession.id.toString();
        const userDoc = await dbPerfiles.get(idString);

        userDoc.password = nuevaPass;
        await dbPerfiles.put(userDoc);

        alert("Código de acceso reescrito en el búnker.");
        document.getElementById('edit-password').value = "";
    } catch (error) {
        alert("Error de encriptación local: " + error.message);
    }
}

// --- HISTORIAL DE DONACIONES DESDE POUCHDB ---

async function cargarHistorialDonaciones() {
    const tableBody = document.getElementById('donations-table-body');
    const totalElement = document.getElementById('user-total-donated');
    const idString = userSession.id.toString();

    try {
        const resultDonaciones = await dbDonaciones.allDocs({ include_docs: true });

        const donations = resultDonaciones.rows
            .map(r => r.doc)
            .filter(d => d.user_id === idString)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (!donations || donations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-secondary py-4">No se detectan transferencias de energía en tu cuenta.</td></tr>';
            totalElement.innerText = "0.00";
            return;
        }

        let totalAcumulado = 0;
        tableBody.innerHTML = "";

        donations.forEach(don => {
            totalAcumulado += parseFloat(don.amount);
            const fecha = new Date(don.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            const badgeSrc = BADGE_IMAGES[don.tier_name] || "assets/img/logos/Logo_sin_fondo.png";

            let tierBadgeClass = "text-white";
            if(don.tier_name.includes("Soldado")) tierBadgeClass = "text-neon-pink";
            if(don.tier_name.includes("Hacker")) tierBadgeClass = "text-info";
            if(don.tier_name.includes("Supremo")) tierBadgeClass = "text-success";
            if(don.tier_name.includes("Comandante")) tierBadgeClass = "text-danger";

            tableBody.innerHTML += `
                <tr class="bg-transparent border-secondary">
                    <td class="font-monospace small align-middle text-secondary">${fecha}</td>
                    <td class="align-middle text-center">
                        <img src="${badgeSrc}" alt="${don.tier_name}"
                             style="width: 35px; height: 35px; object-fit: contain; filter: drop-shadow(0 0 5px rgba(0,255,255,0.2));"
                             title="${don.tier_name}">
                    </td>
                    <td class="${tierBadgeClass} align-middle fw-bold" style="font-size: 0.85rem;">${don.tier_name}</td>
                    <td class="fw-bold text-white align-middle">${parseFloat(don.amount).toFixed(2)} €</td>
                </tr>
            `;
        });

        totalElement.innerText = totalAcumulado.toFixed(2);

    } catch (err) {
        console.error("Error cargando historial de transmisiones monetarias:", err);
    }
}

async function ejecutarCierreSesion() {
    if (confirm("¿Deseas desconectar tu terminal de la red Cybernetik?")) {
        await logout();
    }
}