let userSession = null;

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
    userSession = await checkSession();

    if (!userSession) {
        window.location.href = 'log_in.html';
        return;
    }

    // Ejecutamos ambas cargas
    await cargarDatosPerfil();
    await cargarHistorialDonaciones();
});

// --- LÓGICA DE PERFIL (Avatar, Nombre, Email y RANGOS) ---

async function cargarDatosPerfil() {
    try {
        // Consultamos perfil y donaciones simultáneamente
        const [perfilRes, donacionesRes] = await Promise.all([
            supabaseClient.from('perfiles').select('*').eq('id', userSession.id).single(),
            supabaseClient.from('donations').select('tier_name').eq('user_id', userSession.id).limit(1)
        ]);

        if (perfilRes.error) throw perfilRes.error;
        const perfil = perfilRes.data;
        const tieneDonaciones = donacionesRes.data && donacionesRes.data.length > 0;
        const ultimaDonacion = tieneDonaciones ? donacionesRes.data[0].tier_name : null;

        if (perfil) {
            document.getElementById('edit-username').value = perfil.username || "";
            document.getElementById('edit-email').value = userSession.email;
            document.getElementById('profile-uid').innerText = "ID: " + userSession.id;

            const avatarImg = document.getElementById('profile-avatar');
            if (perfil.avatar_url) avatarImg.src = perfil.avatar_url;

            // --- SISTEMA DE CATEGORÍAS Y BANNERS ---
            const infoCol = document.querySelector('.col-md-8');
            let bannerHTML = '';
            let borderColor = '#6c757d';

            // 1. Prioridad Máxima: DESARROLLADOR
            if (perfil.categoria === 'developer') {
                borderColor = '#dc3545'; // Rojo
                bannerHTML = `
                        <div id="rango-banner" class="alert bg-black border text-white text-center mb-4">
                            <h4 class=" font-original mb-0"><i class="fa-solid fa-terminal me-2"></i>ACCESO DE ARQUITECTO</h4>
                        </div>`;
            }
            // 2. Segunda Prioridad: CONTRIBUIDOR
            else if (tieneDonaciones) {
                borderColor = '#0dcaf0'; // Cyan
                bannerHTML = `
                        <div id="rango-banner" class="alert bg-black border shadow-neon-cyan text-white text-center mb-4">
                            <h4 class=" font-original mb-0"><i class="fa-solid fa-microchip me-2"></i>UNIDAD DE APOYO: ${ultimaDonacion.toUpperCase()}</h4>
                        </div>`;
            }
            // 3. Por defecto: INFILTRADO
            else {
                bannerHTML = `
                        <div id="rango-banner" class="alert bg-black border text-center text-white mb-4 opacity-75">
                            <h4 class="text-secondary font-original mb-0"><i class="fa-solid fa-user-secret me-2"></i>SUJETO: INFILTRADO</h4>
                        </div>`;
            }

            const existingBanner = document.getElementById('rango-banner');
            if (existingBanner) existingBanner.remove();
            infoCol.insertAdjacentHTML('afterbegin', bannerHTML);
            avatarImg.style.border = `3px solid ${borderColor}`;
        }
    } catch (err) {
        console.error("Error cargando perfil:", err.message);
    }
}

async function actualizarFotoPerfil() {
    const fileInput = document.getElementById('avatar-upload');
    const file = fileInput.files[0];
    if (!file) return;

    const imgElement = document.getElementById('profile-avatar');
    const oldSrc = imgElement.src;
    imgElement.style.opacity = "0.5";

    try {
        const filePath = `${userSession.id}/avatar_${Date.now()}.jpg`;
        const { error: uploadError } = await supabaseClient.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const { error: updateError } = await supabaseClient
            .from('perfiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userSession.id);

        if (updateError) throw updateError;

        imgElement.src = publicUrl;
        alert("Sincronización de imagen completada.");

    } catch (err) {
        alert("Fallo en la carga: " + err.message);
        imgElement.src = oldSrc;
    } finally {
        imgElement.style.opacity = "1";
    }
}

async function actualizarNombre() {
    const nuevoNombre = document.getElementById('edit-username').value;
    if (!nuevoNombre) return alert("El nombre es vital para el sistema.");

    const { error } = await supabaseClient
        .from('perfiles')
        .update({ username: nuevoNombre })
        .eq('id', userSession.id);

    if (error) alert("Error de escritura: " + error.message);
    else alert("Identidad actualizada.");
}

async function actualizarEmail() {
    const nuevoEmail = document.getElementById('edit-email').value;
    const { error } = await supabaseClient.auth.updateUser({ email: nuevoEmail });
    if (error) alert("Error de enlace: " + error.message);
    else alert("Protocolo de cambio iniciado. Revisa ambos correos.");
}

async function actualizarPassword() {
    const nuevaPass = document.getElementById('edit-password').value;
    if (nuevaPass.length < 6) return alert("Seguridad insuficiente. Mínimo 6 caracteres.");
    const { error } = await supabaseClient.auth.updateUser({ password: nuevaPass });
    if (error) alert("Error de encriptación: " + error.message);
    else {
        alert("Código de acceso reescrito.");
        document.getElementById('edit-password').value = "";
    }
}

// --- LÓGICA DE DONACIONES ---
async function cargarHistorialDonaciones() {
    const tableBody = document.getElementById('donations-table-body');
    const totalElement = document.getElementById('user-total-donated');

    try {
        const { data: donations, error } = await supabaseClient
            .from('donations')
            .select('*')
            .eq('user_id', userSession.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

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
        console.error("Error cargando donaciones:", err.message);
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}