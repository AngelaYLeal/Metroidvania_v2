gsap.registerPlugin(ScrollTrigger);

// 1. Fijar el personaje mientras haces scroll en las secciones
ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    endTrigger: "#desarrollo", // La imagen se deja de fijar al llegar al contenido
    end: "bottom bottom",
    pin: "#personaje-flotante",
    pinSpacing: false
});

// 2. Animación de entrada del Lema
gsap.from(".lema", {
    scrollTrigger: {
        trigger: ".hero-section",
        start: "top center",
        toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 50,
    duration: 1
});

// 3. Efecto de aparición en la sección de video
gsap.from("#video-content", {
    scrollTrigger: {
        trigger: "#video-content",
        start: "top 80%"
    },
    opacity: 0,
    y: 100,
    duration: 1
});

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero-section", // La sección donde empieza
        start: "top top",
        end: "+=1000", // Distancia que quieres que dure la animación
        scrub: 1,      // El scroll controla la animación suavemente
        pin: true      // Mantiene el hero fijo mientras ocurre el movimiento
    }
});

// Movimiento de la imagen: de derecha (x: 500) al centro-izquierda (x: 0)
tl.fromTo("#personaje-flotante",
    { x: 500, opacity: 0 },
    { x: 0, opacity: 1, duration: 2 }
);

// Opcional: El texto se desvanece mientras la imagen se mueve
tl.to(".lema", { opacity: 0, y: -100 }, 0);

tl.to(".countdown-section", {
    y: 50,
    opacity: 0,
    duration: 1
}, 0);

// 4. El lema también desaparece
tl.to(".lema", {
    opacity: 0,
    y: -50,
    duration: 1
}, 0);