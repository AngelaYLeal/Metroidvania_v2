// js/index.js

window.onload = () => {
    // Inicializar el renderizado adaptativo del Tráiler en el Home
    inicializarVideoHome();
};

function inicializarVideoHome() {
    const container = document.getElementById('dynamic-video-container');
    // Si por alguna razón el script se carga en otra página sin este contenedor, frena la ejecución
    if (!container) return;

    // Evaluamos el Media Query usando el breakpoint de Bootstrap
    const mql = window.matchMedia('(max-width: 1199px)');

    function renderVideo(isMobileOrTablet) {
        container.innerHTML = '';

        if (isMobileOrTablet) {
            // RENDER MENOR QUE DESKTOP
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

    // Ejecución inicial al cargar la página principal
    renderVideo(mql.matches);

    // Escucha activa ante cambios de tamaño en tiempo real (redimensionar ventana o rotar móvil)
    mql.addEventListener('change', (e) => {
        renderVideo(e.matches);
    });
}