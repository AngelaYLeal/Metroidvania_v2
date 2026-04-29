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



