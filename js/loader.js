//LOADER
window.addEventListener("load", function() {
    const loader = document.getElementById("loader-wrapper");
    loader.classList.add("loader-hidden");

    loader.addEventListener("transitionend", function() {
        loader.remove();
    });
});