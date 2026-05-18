// js/view-profile.js

// Diccionario unificado de insignias de la red
const BADGE_IMAGES = {
    "Soldado Raso": "assets/img/badges/soldado.png",
    "Hacker de Élite": "assets/img/badges/hacker.png",
    "Einherjar Supremo": "assets/img/badges/supremo.png",
    "Explorador de Datos": "assets/img/badges/explorador.png",
    "Comandante de Flota": "assets/img/badges/comandante.png",
    "Apoyo Altruista": "assets/img/badges/apoyo.png"
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Extraemos el ID del usuario a consultar desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('id');

    const errorContainer = document.getElementById('error-container');
    const profileContent = document.getElementById('profile-content');

    if (!targetUserId) {
        mostrarError();
        return;
    }

    try {
        // 2. Buscamos el perfil del usuario directamente en PouchDB por su _id único
        const perfil = await dbPerfiles.get(targetUserId.toString()).catch(() => null);

        if (!perfil) {
            mostrarError();
            return;
        }

        // 3. Renderizamos los datos de identidad básicos (Sin Emails)
        document.getElementById('view-username').innerText = perfil.username;
        document.getElementById('view-uid').innerText = `ID_RED: ${perfil._id}`;

        // El avatar se mantiene estático según lo guardado en la base de datos o por defecto
        const avatarImg = document.getElementById('view-avatar');
        if (avatarImg) {
            avatarImg.src = perfil.avatar_url || 'assets/img/logos/Logo_sin_fondo.png';
        }

        // 4. Cargamos y procesamos todas las donaciones de la base de datos
        const resultDonaciones = await dbDonaciones.allDocs({ include_docs: true });

        // Filtramos las donaciones que pertenezcan en exclusiva a este usuario
        const listaDonaciones = resultDonaciones.rows
            .map(r => r.doc)
            .filter(d => d.user_id === targetUserId.toString())
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // De más reciente a más antigua

        // 5. Calculamos y renderizamos el total acumulado de energía (donaciones)
        const totalDonado = listaDonaciones.reduce((sum, donacion) => sum + Number(donacion.amount || 0), 0);
        document.getElementById('view-total-donated').innerText = totalDonado.toFixed(2);

        // 6. Inyectamos la insignia de rol/categoría de manera puramente visual (Banner superior)
        const bannerContainer = document.getElementById('banner-container');
        if (bannerContainer) {
            if (perfil.categoria === 'developer') {
                bannerContainer.innerHTML = `
                    <div class="alert alert-info text-center border-info bg-black text-info font-monospace mb-4" style="letter-spacing: 2px;">
                        <i class="fa-solid fa-code me-2"></i> PERFIL CLASIFICADO: DESARROLLADOR DEL PROYECTO
                    </div>
                `;
            } else if (listaDonaciones.length > 0) {
                bannerContainer.innerHTML = `
                    <div class="alert alert-warning text-center border-warning bg-black text-warning font-monospace mb-4" style="letter-spacing: 2px;">
                        <i class="fa-solid fa-id-card me-2"></i> OPERADOR AUTENTICADO: MECENAS ACTIVO
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="alert alert-secondary text-center border-secondary bg-black text-secondary font-monospace mb-4" style="letter-spacing: 2px;">
                        <i class="fa-solid fa-user me-2"></i> OPERADOR REGISTRADO: CIVIL DEL BÚNKER
                    </div>
                `;
            }
        }

        // 7. Renderizamos las filas de la tabla de Historial de Sincronizaciones
        const tablaBody = document.getElementById('view-donations-table-body');

        if (listaDonaciones.length === 0) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-secondary py-3 italic">
                        No se registran transferencias de energía de este operador.
                    </td>
                </tr>
            `;
        } else {
            tablaBody.innerHTML = listaDonaciones.map(donacion => {
                // Formateamos la fecha a una estructura legible
                const fecha = new Date(donacion.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // --- CORRECCIÓN DE INSIGNIAS SIMÉTRICAS ---
                // Buscamos la imagen física vinculada en tu catálogo usando el tier_name exacto
                const imgSrc = BADGE_IMAGES[donacion.tier_name] || "assets/img/logos/Logo_sin_fondo.png";

                // Generamos la celda usando la imagen en lugar del icono FontAwesome
                const insigniaRender = `
                    <img src="${imgSrc}" 
                         alt="${donacion.tier_name}" 
                         title="${donacion.tier_name}" 
                         style="width: 28px; height: auto; vertical-align: middle;">
                `;
                // ------------------------------------------

                return `
                    <tr class="align-middle">
                        <td class="font-monospace small">${fecha}</td>
                        <td class="text">${insigniaRender}</td>
                        <td><span class="badge bg-dark border border-secondary text-white">${donacion.tier_name}</span></td>
                    </tr>
                `;
            }).join('');
        }

        // Mostramos el contenido una vez cargado todo sin errores
        profileContent.classList.remove('d-none');

    } catch (err) {
        console.error("Fallo crítico al leer el búnker de perfiles públicos:", err);
        mostrarError();
    }

    function mostrarError() {
        errorContainer.classList.remove('d-none');
        profileContent.classList.add('d-none');
    }
});