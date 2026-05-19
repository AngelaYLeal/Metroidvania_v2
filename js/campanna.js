// js/campanna.js

// Estado global temporal del proceso de donación en curso
let currentDonationTier = "";
let currentDonationAmount = 0;
let donationModalInstance = null;

window.onload = async () => {
    // 1. Inicializar Sistema de Donaciones y Progreso de Barra
    await actualizarProgresoFinanciacion();
    inicializarEventosDonaciones();

    // 2. Inicializar Banda Sonora con WaveSurfer.js
    inicializarReproductoresAudio();

    // 3. Inicializar renderizado adaptativo del Trailer (VideoJS)
    inicializarVideoAdaptativo();
};

/* ==========================================================================
   SECCIÓN: SISTEMA DE FINANCIACIÓN & EVENTOS
   ========================================================================== */
async function actualizarProgresoFinanciacion() {
    const currentAmountEl = document.getElementById('current-amount');
    const fundingBarEl = document.getElementById('funding-bar');
    const percentageLabelEl = document.getElementById('percentage-label');

    const META_MAXIMA = 20000;

    try {
        const { data, error } = await supabaseClient
            .from('donations')
            .select('amount');

        if (error) throw error;

        let totalRecaudado = 0;
        if (data && data.length > 0) {
            totalRecaudado = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        }

        currentAmountEl.innerText = totalRecaudado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        let porcentaje = (totalRecaudado / META_MAXIMA) * 100;
        if (porcentaje > 100) porcentaje = 100;

        setTimeout(() => {
            if (fundingBarEl) fundingBarEl.style.width = `${porcentaje}%`;
            if (percentageLabelEl) percentageLabelEl.innerText = `${porcentaje.toFixed(1)}%`;
        }, 300);

    } catch (err) {
        console.error("Error calculando el progreso financiero global:", err.message);
    }
}

function inicializarEventosDonaciones() {
    const modalEl = document.getElementById('donationAuthModal');
    if (modalEl) {
        donationModalInstance = new bootstrap.Modal(modalEl);
    }

    document.querySelectorAll('.btn-donate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tier = e.target.getAttribute('data-tier');
            const amount = parseFloat(e.target.getAttribute('data-amount'));
            initiateDonation(tier, amount);
        });
    });

    const customForm = document.getElementById('customDonationForm');
    if (customForm) {
        customForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountVal = parseFloat(document.getElementById('custom-donation-amount').value);
            if (!amountVal || amountVal <= 0) {
                alert("Introduce un monto de sincronización de energía válido.");
                return;
            }
            initiateDonation('Apoyo Altruista', amountVal);
        });
    }

    const btnAnon = document.getElementById('btn-anon-donate');
    if (btnAnon) {
        btnAnon.addEventListener('click', () => {
            ejecutarProcesoDonacion(null);
        });
    }
}

async function initiateDonation(tierName, amount) {
    currentDonationTier = tierName;
    currentDonationAmount = amount;

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session && session.user) {
            await ejecutarProcesoDonacion(session.user.id);
        } else {
            if (donationModalInstance) donationModalInstance.show();
        }
    } catch (err) {
        console.error("Error al validar la sesión del Einherjar:", err.message);
    }
}

async function ejecutarProcesoDonacion(userId = null) {
    if (donationModalInstance) donationModalInstance.hide();

    try {
        const { error } = await supabaseClient
            .from('donations')
            .insert([
                {
                    user_id: userId,
                    tier_name: currentDonationTier,
                    amount: currentDonationAmount
                }
            ]);

        if (error) throw error;

        alert(`¡Sincronización Exitosa!\nHas aportado ${currentDonationAmount}€ en el tier [${currentDonationTier}]. Gracias por apoyar la red.`);
        await actualizarProgresoFinanciacion();

        const inputCustom = document.getElementById('custom-donation-amount');
        if (inputCustom) inputCustom.value = "";

    } catch (err) {
        alert("Error al procesar la transferencia cuántica: " + err.message);
    }
}

/* ==========================================================================
   SECCIÓN: REPRODUCTORES DE BANDA SONORA (WAVESURFER)
   ========================================================================== */
function inicializarReproductoresAudio() {
    const ws1 = WaveSurfer.create({
        container: '#waveform-1',
        waveColor: '#4a4a4a',
        progressColor: '#0dcaf0',
        url: 'assets/audio/cybernetik_awakening.mp3',
        height: 50,
        responsive: true
    });

    const ws2 = WaveSurfer.create({
        container: '#waveform-2',
        waveColor: '#4a4a4a',
        progressColor: '#d63384',
        url: 'assets/audio/neon_blood.mp3',
        height: 50,
        responsive: true
    });

    const btn1 = document.getElementById('btn-play-1');
    const icon1 = document.getElementById('icon-play-1');
    if (btn1 && icon1) {
        btn1.addEventListener('click', () => {
            ws1.playPause();
            if (ws1.isPlaying()) {
                ws2.pause();
                icon1.className = "fa-solid fa-pause px-1";
            } else {
                icon1.className = "fa-solid fa-play px-1";
            }
        });
        ws1.on('pause', () => icon1.className = "fa-solid fa-play px-1");
    }

    const btn2 = document.getElementById('btn-play-2');
    const icon2 = document.getElementById('icon-play-2');
    if (btn2 && icon2) {
        btn2.addEventListener('click', () => {
            ws2.playPause();
            if (ws2.isPlaying()) {
                ws1.pause();
                icon2.className = "fa-solid fa-pause px-1";
            } else {
                icon2.className = "fa-solid fa-play px-1";
            }
        });
        ws2.on('pause', () => icon2.className = "fa-solid fa-play px-1");
    }
}

/* ==========================================================================
    SECCIÓN: REPRODUCTOR DE VIDEO ADAPTATIVO (VIDEOJS)
   ========================================================================== */
function inicializarVideoAdaptativo() {
    const container = document.getElementById('dynamic-video-container');
    if (!container) return;

    // Evaluamos el Media Query usando el breakpoint LG de Bootstrap (991px)
    const mql = window.matchMedia('(max-width: 991px)');

    function renderVideo(isMobile) {
        container.innerHTML = '';

        if (isMobile) {
            // RENDER MÓVIL: Usa la interfaz simplificada <video-minimal-skin>
            container.innerHTML = `
        <video-player>
          <video-minimal-skin>
            <video src="./assets/videos/MetroidVideo.mp4" poster="./assets/videos/miniatura.jpg" playsinline></video>
          </video-minimal-skin>
        </video-player>
      `;
        } else {
            // RENDER DESKTOP: Usa la interfaz completa <video-skin>
            container.innerHTML = `
        <video-player>
          <video-skin>
            <video src="./assets/videos/MetroidVideo.mp4" poster="./assets/videos/miniatura.jpg" playsinline></video>
          </video-skin>
        </video-player>
      `;
        }
    }

    // Ejecución inicial al cargar la sección de la campaña
    renderVideo(mql.matches);

    // Escucha activa ante cambios de tamaño en tiempo real
    mql.addEventListener('change', (e) => {
        renderVideo(e.matches);
    });
}