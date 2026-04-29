// WAVE SURFER JS
document.addEventListener("DOMContentLoaded", () => {
    // Verificamos que el contenedor exista para evitar errores en otras páginas
    if (!document.getElementById('waveform-1')) return;

    // --- PISTA 1: Cybernetik Awakening ---
    const wavesurfer1 = WaveSurfer.create({
        container: '#waveform-1',
        waveColor: '#444444',
        progressColor: '#00ffff',
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        height: 60,
        url: 'assets/audio/ost_theme.mp3',
        plugins: [
            WaveSurfer.Hover.create({
                lineColor: '#ff0000',
                lineWidth: 2,
                labelBackground: '#555',
                labelColor: '#fff',
                labelSize: '11px',
                labelPreferLeft: false,
            }),
        ],
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
        progressColor: '#ff00ff',
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        height: 60,
        url: './assets/audio/ost_theme2.mp3',
        plugins: [
            WaveSurfer.Hover.create({
                lineColor: '#ff0000',
                lineWidth: 2,
                labelBackground: '#555',
                labelColor: '#fff',
                labelSize: '11px',
                labelPreferLeft: false,

            }),
        ],
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