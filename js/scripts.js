const modal = document.getElementById("video-modal");
const video = document.getElementById("video-player");
const btnAbrir = document.getElementById("open-video");
const btnCerrar = document.getElementById("close-video");
const navbar = document.querySelector(".navbar"); // Seleccionamos el nav

// Abrir modal
btnAbrir.addEventListener("click", () => {
    modal.classList.add("is-active");
    // Ocultar el navbar
    if (navbar) navbar.style.display = "none";
    video.play();
});

// Función para cerrar
const cerrarModal = () => {
    modal.classList.remove("is-active");
    // Mostrar el navbar de nuevo
    if (navbar) navbar.style.display = "flex";
    video.pause();
    video.currentTime = 0;
};

btnCerrar.addEventListener("click", cerrarModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        cerrarModal();
    }
});


//SLIDER DE DONACIONES

document.addEventListener( 'DOMContentLoaded', function () {
    new Splide( '#donation-sidebar .splide', { // Selector específico para el sidebar
        type   : 'loop',
        drag   : 'free',
        perPage: 1,            // 1 nombre a la vez para que se lea bien en la barra
        autoScroll: {
            speed: 0.0001,          // Un poco más lento para que sea elegante
            pauseOnHover: true,  // Se detiene si el usuario quiere leer un nombre
        },
    }).mount( window.splide.Extensions );
});


// WAVE SURFER JS

document.addEventListener("DOMContentLoaded", () => {
    // Verificamos que el contenedor exista para evitar errores en otras páginas
    if (!document.getElementById('waveform-1')) return;

    // --- PISTA 1: Cybernetik Awakening ---
    const wavesurfer1 = WaveSurfer.create({
        container: '#waveform-1',
        waveColor: '#444444',        // Color de la onda sin reproducir
        progressColor: '#00ffff',    // Color cyan neón al avanzar
        barWidth: 2,                 // Ondas en formato de barras
        barGap: 2,
        barRadius: 2,
        height: 60,                  // Altura de la onda
        url: '/assets/audio/ost_theme.mp3' // Ruta de tu primer audio
    });

    const btnPlay1 = document.getElementById('btn-play-1');
    const iconPlay1 = document.getElementById('icon-play-1');

    btnPlay1.addEventListener('click', () => {
        wavesurfer1.playPause();
    });

    wavesurfer1.on('play', () => {
        iconPlay1.classList.remove('fa-play');
        iconPlay1.classList.add('fa-pause');
    });

    wavesurfer1.on('pause', () => {
        iconPlay1.classList.remove('fa-pause');
        iconPlay1.classList.add('fa-play');
    });

    // --- PISTA 2: Neon Blood ---
    const wavesurfer2 = WaveSurfer.create({
        container: '#waveform-2',
        waveColor: '#444444',
        progressColor: '#ff00ff',    // Color rosa neón al avanzar
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        height: 60,
        url: '/assets/audio/ost_theme2.mp3' // Ruta de tu segundo audio
    });

    const btnPlay2 = document.getElementById('btn-play-2');
    const iconPlay2 = document.getElementById('icon-play-2');

    btnPlay2.addEventListener('click', () => {
        wavesurfer2.playPause();
    });

    wavesurfer2.on('play', () => {
        iconPlay2.classList.remove('fa-play');
        iconPlay2.classList.add('fa-pause');
    });

    wavesurfer2.on('pause', () => {
        iconPlay2.classList.remove('fa-pause');
        iconPlay2.classList.add('fa-play');
    });

    // Opcional: Pausar una pista si se le da al play a la otra
    wavesurfer1.on('play', () => wavesurfer2.pause());
    wavesurfer2.on('play', () => wavesurfer1.pause());
});
