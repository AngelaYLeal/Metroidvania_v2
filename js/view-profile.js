// js/view-profile.js

// Diccionario de imágenes de insignias
const BADGE_IMAGES = {
    "Soldado Raso": "assets/img/badges/soldado.png",
    "Hacker de Élite": "assets/img/badges/hacker.png",
    "Einherjar Supremo": "assets/img/badges/supremo.png",
    "Explorador de Datos": "assets/img/badges/explorador.png",
    "Comandante de Flota": "assets/img/badges/comandante.png",
    "Apoyo Altruista": "assets/img/badges/apoyo.png"
};

// Captura de parámetros de la URL e inicialización de consultas
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const targetUserId = urlParams.get('id');
    const targetUsername = urlParams.get('username');

    if (!targetUserId && !targetUsername) {
        mostrarError();
        return;
    }

    try {
        let userId = targetUserId;

        // Si solo viene el nombre de usuario por URL, buscamos su ID correspondiente
        if (targetUsername && !targetUserId) {
            const { data, error } = await supabaseClient
                .from('perfiles')
                .select('id')
                .ilike('username', targetUsername)
                .single();

            if (error || !data) throw new Error("Usuario no encontrado por nombre.");
            userId = data.id;
        }

        // Ejecutamos la carga de datos del operador destino
        await cargarDatosPerfilPublico(userId);
        await cargarHistorialDonacionesPublico(userId);

    } catch (err) {
        console.error(err.message);
        mostrarError();
    }
});

function mostrarError() {
    document.getElementById('error-container').classList.remove('d-none');
    document.getElementById('profile-content').classList.add('d-none');
}

async function cargarDatosPerfilPublico(userId) {
    try {
        // Consultamos perfil y donaciones simultáneamente para optimizar red
        const [perfilRes, donacionesRes] = await Promise.all([
            supabaseClient.from('perfiles').select('*').eq('id', userId).single(),
            supabaseClient.from('donations').select('tier_name').eq('user_id', userId).limit(1)
        ]);

        if (perfilRes.error) {
            mostrarError();
            return;
        }

        const perfil = perfilRes.data;
        const tieneDonaciones = donacionesRes.data && donacionesRes.data.length > 0;
        const ultimaDonacion = tieneDonaciones ? donacionesRes.data[0].tier_name : null;

        // Mostrar contenedor principal
        document.getElementById('profile-content').classList.remove('d-none');

        // Inyección de datos base
        document.getElementById('view-username').innerText = perfil.username || "Desconocido";
        document.getElementById('view-uid').innerText = "ID: " + perfil.id.substring(0, 8) + "...";

        const avatarImg = document.getElementById('view-avatar');
        if (perfil.avatar_url) avatarImg.src = perfil.avatar_url;

        // --- SISTEMA DE CATEGORÍAS Y BANNERS ---
        const bannerContainer = document.getElementById('banner-container');
        let bannerHTML = '';
        let borderColor = '#6c757d';

        // 1. Prioridad Máxima: DESARROLLADOR
        if (perfil.categoria === 'developer') {
            borderColor = '#dc3545'; // Rojo
            bannerHTML = `
                  <div class="alert bg-black border text-white text-center mb-4">
                      <h4 class="font-original mb-0"><i class="fa-solid fa-terminal me-2"></i>DESARROLLADOR</h4>
                  </div>`;
        }
        // 2. Segunda Prioridad: CONTRIBUIDOR
        else if (tieneDonaciones) {
            borderColor = '#0dcaf0'; // Cyan
            bannerHTML = `
                  <div class="alert bg-black border shadow-neon-cyan text-white text-center mb-4">
                      <h4 class="font-original mb-0"><i class="fa-solid fa-microchip me-2"></i>CONTRIBUIDOR: ${ultimaDonacion.toUpperCase()}</h4>
                  </div>`;
        }
        // 3. Por defecto: INFILTRADO / SUJETO BASE
        else {
            bannerHTML = `
                  <div class="alert bg-black border text-center text-white mb-4 opacity-75">
                      <h4 class="font-original mb-0"><i class="fa-solid fa-user-secret me-2"></i>SUJETO: NPC</h4>
                  </div>`;
        }

        bannerContainer.innerHTML = bannerHTML;
        avatarImg.style.border = `3px solid ${borderColor}`;

    } catch (err) {
        console.error("Error cargando perfil público:", err.message);
        mostrarError();
    }
}

async function cargarHistorialDonacionesPublico(userId) {
    const tableBody = document.getElementById('view-donations-table-body');
    const totalElement = document.getElementById('view-total-donated');

    try {
        const { data: donations, error } = await supabaseClient
            .from('donations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!donations || donations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-secondary py-4">Sin registros de transferencia energética.</td></tr>';
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
                  </tr>
              `;
        });

        totalElement.innerText = totalAcumulado.toFixed(2);

    } catch (err) {
        console.error("Error cargando donaciones:", err.message);
    }
}