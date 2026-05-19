document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('dynamic-video-container');
    if (!container) return;

    // estructura universal
    container.innerHTML = `
        <div id="cyber-player" class="cyber-player-container">
            
            <div id="initial-overlay" class="initial-overlay">
                <img src="assets/img/icons/boton-de-play.png" alt="Reproducir Tráiler">
            </div>

            <video id="cyber-video" src="./assets/videos/trailer.mp4" poster="./assets/videos/miniatura.png" playsinline></video>
            
            <div id="cyber-controls" class="cyber-controls" style="display: none;">
                <div class="cyber-progress-container" id="progress-container">
                    <div class="cyber-progress-bar" id="progress-bar"></div>
                </div>
                
                <div class="controls-row">
                    <div class="controls-left">
                        <button class="cyber-btn" id="play-btn"><i class="fa-solid fa-play"></i></button>
                        <button class="cyber-btn" id="rewind-btn" title="Atrás 5s"><i class="fa-solid fa-rotate-left"></i></button>
                        <button class="cyber-btn" id="forward-btn" title="Adelante 5s"><i class="fa-solid fa-rotate-right"></i></button>
                        <span class="cyber-time-display" id="time-display">00:00 / 00:00</span>
                    </div>
                    <div class="controls-right">
                        <button class="cyber-btn" id="mute-btn"><i class="fa-solid fa-volume-high"></i></button>
                        <button class="cyber-btn" id="fullscreen-btn"><i class="fa-solid fa-expand"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const playerContainer = document.getElementById('cyber-player');
    const overlay = document.getElementById('initial-overlay');
    const controlsBar = document.getElementById('cyber-controls');
    const video = document.getElementById('cyber-video');

    // Botones
    const playBtn = document.getElementById('play-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const muteBtn = document.getElementById('mute-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');

    // ==========================================
    // 1. INICIO DE REPRODUCCIÓN (Botón gigante)
    // ==========================================
    overlay.addEventListener('click', () => {
        overlay.style.display = 'none'; // Ocultamos el icono central
        controlsBar.style.display = 'flex'; // Activamos la barra de controles
        playerContainer.classList.add('is-playing'); // Clase para mostrar controles en hover
        video.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    });

    // ==========================================
    // 2. CONTROLES DE LA BARRA
    // ==========================================

    // Play/Pausa
    function togglePlay() {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            video.pause();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    }
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay); // Play/Pausa al tocar el video

    // Salto +/- 5 segundos
    rewindBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 5);
    });

    forwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
    });

    // Barra de tiempo y progreso
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const percentage = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percentage}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    });

    video.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
    });

    // Clic en la barra de progreso para buscar
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        video.currentTime = (clickX / rect.width) * video.duration;
    });

    // Silenciar
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (video.muted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            muteBtn.style.color = '#ff0055';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            muteBtn.style.color = '#fff';
        }
    });

    // Pantalla completa
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            playerContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement
            ? '<i class="fa-solid fa-compress"></i>'
            : '<i class="fa-solid fa-expand"></i>';
    });
});

window.onload = async () => {
    // ... tu otra lógica de inicialización (como la navbar) ...

    // Inicializar Galería Swiper
    const gallerySwiper = new Swiper('.gallery-swiper', {
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.gallery-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        speed: 1000
    });
};