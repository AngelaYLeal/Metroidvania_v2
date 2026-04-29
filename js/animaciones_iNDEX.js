gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);
let mm = gsap.matchMedia();

// ==========================================
// 1. ESCRITORIO (Desktop > 991px)
// ==========================================
mm.add("(min-width: 992px)", () => {
    // Estados iniciales
    gsap.set("#cta-video", { y: "100%", opacity: 0 });
    gsap.set("#donation", { rotationX: -90, transformOrigin: "50% 100%", opacity: 0 });
    gsap.set("#game-info", { x: "100%", opacity: 0 });
    gsap.set("#comments", { y: "100%", opacity: 0, pointerEvents: "none" });
    gsap.set("#core-loop", {y: "100%", opacity: 0 });
    gsap.set("#core-loop .col-lg-4", { opacity: 0, scale: 0.8 });

    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#pin-wrapper",
            start: "top top",
            end: "+=5000",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            pinSpacing: true
        }
    });

    masterTl
        // STEP 1: Hero sale, Video entra
        .to(".logo-wrapper, .lema, .description, .countdown-section", { opacity: 0, x: -100, duration: 1 }, "step1")
        .to("#personaje-flotante", { x: "-50vw", duration: 1, opacity:1 }, "step1")
        .to("#cta-video", { y: "0%", opacity: 1, pointerEvents: "auto", duration: 1 }, "step1")

        // NUEVO STEP: Video sale, CORE LOOP entra y se "virtualiza"
        .to("#cta-video", { y: "-100%", opacity: 0, duration: 2 }, "step-core")
        .to("#personaje-flotante", { opacity: 0,x:"-80vw",scale:0.8, duration: 1, ease: "power1.inOut" }, "step-core")
        .to("#core-loop", { y: "0%", opacity: 1, duration: 1 }, "step-core")
        .to({}, {
            duration: 0.1, // No ocupa casi espacio en el scroll
            onStart: () => {
                // Hacia adelante: Animación por TIEMPO (1 segundo de separación)
                gsap.fromTo("#core-loop .col-lg-4",
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.5, stagger: 0.25, overwrite: "auto", ease: "power2.out" }
                );
            },
            onReverseComplete: () => {
                // Hacia atrás: Si el usuario vuelve a subir, ocultamos las tarjetas
                // para que la animación vuelva a funcionar si baja de nuevo.
                gsap.to("#core-loop .col-lg-4", { opacity: 0, scale: 0.8, duration: 0.3, overwrite: "auto" });
            }
        }, "step-core+=0.5")
        // STEP 2: CORE LOOP sale (modificado), Donaciones entra
        .to("#core-loop", { y: "-50vh", rotationX: 90, opacity: 0, duration: 1 }, "step2")
        .to("#donation", { rotationX: 0, opacity: 1, pointerEvents: "auto", duration: 1.5 }, "step2")

        // STEP 3: Donaciones sale, Info entra
        .to("#donation", { x: "-100%", opacity: 0, duration: 1 }, "step3")
        .to("#game-info", { x: "0%", opacity: 1, pointerEvents: "auto", duration: 1 }, "step3")

        // STEP 4: Info sale, Comentarios entra
        .to("#game-info", { opacity: 0, duration: 1 }, "step4")
        .to("#comments", { y: "0%", opacity: 1, pointerEvents: "auto", duration: 1.2 }, "step4");

    return () => gsap.set("*", { clearProps: "all" });
});


// ==========================================
// 3. MÓVILES
// ==========================================
mm.add("(max-width: 1023px)", () => {

    gsap.set("section", {
        position: "relative",
        clearProps: "all",
        opacity: 1
    });

    // Desactivar ScrollSpy de Bootstrap
    const spy = document.querySelector('[data-bs-spy="scroll"]');
    if (spy) spy.removeAttribute('data-bs-spy');
});

// 4. SWIPER (Funciona en ambos modos) [cite: 86]
const swiper = new Swiper('.my-slider', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    autoHeight: false,
});


// btn top

ScrollTrigger.create({
    trigger: "body",
    start: "500px top",
    onEnter: () => gsap.to("#back-to-top", { opacity: 1, visibility: "visible", duration: 0.3 }),
    onLeaveBack: () => gsap.to("#back-to-top", { opacity: 0, visibility: "hidden", duration: 0.3 })
});

document.querySelector("#back-to-top").addEventListener("click", (e) => {
    e.preventDefault(); // Evitamos recargas indeseadas

    gsap.to(window, {
        scrollTo: {
            y: 0,
            autoKill: false
        },
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: "auto"
    });
});
