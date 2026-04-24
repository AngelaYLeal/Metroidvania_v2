//LOADER
window.addEventListener("load", function() {
    const loader = document.getElementById("loader-wrapper");
    // Añadimos la clase para ocultarlo con la transición
    loader.classList.add("loader-hidden");

    // Lo eliminamos del DOM después de la animación para que no moleste
    loader.addEventListener("transitionend", function() {
        loader.remove();
    });
});