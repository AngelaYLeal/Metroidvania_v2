// my-wavesurfer.js (Reescrito como Reproductor Custom para esquivar CORS)
document.addEventListener("DOMContentLoaded", () => {

    // Función creadora para no repetir código
    const setupCustomPlayer = (num) => {
        const audio = document.getElementById(`audio-${num}`);
        const btn = document.getElementById(`btn-play-${num}`);
        const icon = document.getElementById(`icon-play-${num}`);
        const timeline = document.getElementById(`timeline-${num}`);
        const progress = document.getElementById(`progress-${num}`);
        const timeDisplay = document.getElementById(`time-${num}`);

        if (!audio || !btn) return;

        // Ayudante para que el tiempo se vea como "1:05"
        const formatTime = (seconds) => {
            if (isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        // 1. Mostrar la duración cuando el audio esté listo
        audio.addEventListener('loadedmetadata', () => {
            timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });

        // 2. Evento del botón Play / Pause
        btn.addEventListener('click', () => {
            if (audio.paused) {
                // Pausar todos los audios antes de darle al play a este
                document.querySelectorAll('audio').forEach(a => a.pause());
                // Resetear todos los iconos a "Play"
                document.querySelectorAll('[id^="icon-play-"]').forEach(i => {
                    i.classList.remove('fa-pause');
                    i.classList.add('fa-play');
                });

                // Reproducir el nuestro
                audio.play();
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            } else {
                audio.pause();
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });

        // 3. Que la barra avance y el tiempo se actualice
        audio.addEventListener('timeupdate', () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percentage}%`;
            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        });

        // 4. Que se pueda hacer clic en la barra para adelantar
        timeline.addEventListener('click', (e) => {
            const timelineWidth = timeline.clientWidth;
            const clickX = e.offsetX;
            audio.currentTime = (clickX / timelineWidth) * audio.duration;
        });

        // 5. Cuando termine la pista, volver el icono a Play
        audio.addEventListener('ended', () => {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            progress.style.width = '0%';
            timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });

        const hoverTime = document.getElementById(`hover-${num}`);

// 6. Lógica de Hover para ver el tiempo al que saltaría
        timeline.addEventListener('mousemove', (e) => {
            const timelineWidth = timeline.clientWidth;
            const offsetX = e.offsetX;
            const duration = audio.duration;

            if (!duration) return;

            // Calcular el tiempo según la posición del ratón
            const calculatedTime = (offsetX / timelineWidth) * duration;

            // Actualizar el texto del tooltip
            hoverTime.textContent = formatTime(calculatedTime);

            // Mover el tooltip siguiendo al ratón
            hoverTime.style.left = `${offsetX}px`;
        });


    };

    // Inicializar ambas pistas
    setupCustomPlayer(1);
    setupCustomPlayer(2);
});