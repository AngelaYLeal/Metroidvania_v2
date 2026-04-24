gsap.registerPlugin(ScrollTrigger);
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

    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#pin-wrapper",
            start: "top top",
            end: "+=4000",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            pinSpacing: true
        }
    });

    masterTl.to(".logo-wrapper, .lema, .countdown-section", { opacity: 0, x: -100, duration: 1 }, "step1")
        .to("#personaje-flotante", { x: "-50vw", duration: 1 }, "step1")
        .to("#cta-video", { y: "0%", opacity: 1, pointerEvents: "auto", duration: 1 }, "step1")
        .to(["#hero", "#cta-video"], { y: "-50vh", rotationX: 90, opacity: 0, duration: 1.5 }, "step2")
        .to("#donation", { rotationX: 0, opacity: 1, pointerEvents: "auto", duration: 1.5 }, "step2")
        .to("#donation", { x: "-100%", opacity: 0, duration: 1 }, "step3")
        .to("#game-info", { x: "0%", opacity: 1, pointerEvents: "auto", duration: 1 }, "step3")
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

