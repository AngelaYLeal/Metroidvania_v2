gsap.registerPlugin(ScrollTrigger);

// Consolidamos todo en una sola línea de tiempo maestra para el Hero
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=1200", // Controla la duración del "viaje" al hacer scroll
        scrub: 1,      // Sincronización suave
        pin: true,     // Mantiene el Hero estático mientras ocurre la magia
        pinSpacing: true
    }
});

// 1. Animación de Samus (Entrada desde la derecha)
tl.fromTo("#personaje-flotante",
    { x: 500, opacity: 0 },
    { x: 0, opacity: 1, duration: 2 }, 0
);

// 2. Animación del Logo (Desaparece hacia arriba)
tl.to(".logo-wrapper", { y: -100, opacity: 0, duration: 1 }, 0);

// 3. Animación del Lema (Desaparece hacia arriba)
tl.to(".lema", { y: -100, opacity: 0, duration: 1 }, 0);

// 4. Animación del Reloj (Desaparece hacia abajo)
tl.to(".countdown-section", { y: 100, opacity: 0, duration: 1 }, 0);

// --- SECCIONES POSTERIORES (Fuera del Hero) ---

// 5. Efecto de aparición en la sección de video (No necesita pinning)
gsap.from("#video-content", {
    scrollTrigger: {
        trigger: "#video-content",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 100,
    duration: 1
});