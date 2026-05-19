gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);
let mm = gsap.matchMedia();

// ==========================================
// 1. ESCRITORIO (Desktop > 1024px)
// ==========================================
mm.add("(min-width: 1024px)", () => {

    // FUNCIONES CALCULADORAS DE AUTOCENTRADO DINÁMICO
    const getHeroX = () => {
        const pinWrapper = document.getElementById('pin-wrapper');
        const heroTarget = document.querySelector('.hero-aron-target');
        if (!pinWrapper || !heroTarget) return 0;

        const wrapperRect = pinWrapper.getBoundingClientRect();
        const targetRect = heroTarget.getBoundingClientRect();
        // Devuelve el punto central exacto del tercio derecho del Hero
        return targetRect.left - wrapperRect.left + (targetRect.width / 2);
    };

    const getCtaX = () => {
        const pinWrapper = document.getElementById('pin-wrapper');
        const ctaTarget = document.querySelector('.cta-aron-target');
        if (!pinWrapper || !ctaTarget) return 0;

        const wrapperRect = pinWrapper.getBoundingClientRect();
        const targetRect = ctaTarget.getBoundingClientRect();
        // Devuelve el punto central exacto del tercio izquierdo del CTA Video
        return targetRect.left - wrapperRect.left + (targetRect.width / 2);
    };

    // Estados iniciales nativos
    gsap.set("#cta-video", { y: "100%", opacity: 0 });
    gsap.set("#donation", { rotationX: -90, transformOrigin: "50% 100%", opacity: 0 });
    gsap.set("#game-info", { x: "100%", opacity: 0 });
    gsap.set("#comments", { y: "100%", opacity: 0, pointerEvents: "none" });
    gsap.set("#core-loop", { y: "100%", opacity: 0 });
    gsap.set("#core-loop .col-lg-4", { opacity: 0, scale: 0.8 });

    //  el pivote de Aron exactamente centrado en su coordenada de anclaje
    gsap.set("#personaje-flotante", {
        x: getHeroX,
        xPercent: -50,
        yPercent: -50,
        opacity: 1
    });

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
        // STEP 1: Hero sale, Video entra y Aron se desplaza centrándose al tercio izquierdo
        .to(".logo-wrapper, .lema, .description, .countdown-section", { opacity: 0, x: -100, duration: 1 }, "step1")
        .to("#personaje-flotante", { x: getCtaX, duration: 1, opacity: 1 }, "step1")
        .to("#cta-video", { y: "0%", opacity: 1, pointerEvents: "auto", duration: 1 }, "step1")

        // STEP 2: Video sale, CORE LOOP entra y Aron sale elegantemente hacia la izquierda
        .to("#cta-video", { y: "-100%", opacity: 0, duration: 2 }, "step-core")
        .to("#personaje-flotante", {
            x: () => getCtaX() - 300,
            opacity: 0,
            scale: 0.8,
            duration: 1,
            ease: "power1.inOut"
        }, "step-core")
        .to("#core-loop", { y: "0%", opacity: 1, duration: 1 }, "step-core")
        .to({}, {
            duration: 0.1,
            onStart: () => {
                gsap.fromTo("#core-loop .col-lg-4",
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.5, stagger: 0.25, overwrite: "auto", ease: "power2.out" }
                );
            },
            onReverseComplete: () => {
                gsap.to("#core-loop .col-lg-4", { opacity: 0, scale: 0.8, duration: 0.3, overwrite: "auto" });
            }
        }, "step-core+=0.5")

        // STEP 3: CORE LOOP sale, Donaciones entra
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
// 2. MÓVILES y TABLETS (< 1024px)
// ==========================================
mm.add("(max-width: 1023.98px)", () => {
    // Matamos los ScrollTriggers de escritorio para que no interfieran
    ScrollTrigger.getAll().forEach(t => t.kill());

    // Reseteamos estilos que GSAP pueda haber dejado clavados en PC
    gsap.set("section, #pin-wrapper, #personaje-flotante", { clearProps: "all" });
    gsap.set("section", { position: "relative", opacity: 1 });

    // === MOVIMIENTO FÍSICO DEL ELEMENTO EN EL HTML ===
    const aron = document.getElementById("personaje-flotante");
    const ctaSection = document.getElementById("cta-video");

    if (aron && ctaSection) {

        ctaSection.insertBefore(aron, ctaSection.firstChild);

        gsap.set(aron, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "block",
            zIndex: 1,
            filter: "brightness(0.55)",
            opacity: 1,
            visibility: "visible",
            pointerEvents: "none"
        });
    }

    const spy = document.querySelector('[data-bs-spy="scroll"]');
    if (spy) spy.removeAttribute('data-bs-spy');

    return () => {
        const heroSection = document.getElementById("hero");
        if (aron && heroSection) {
            heroSection.appendChild(aron);
        }
    };
});
// 3. SWIPER
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

// Botón volver arriba (Back to top)
ScrollTrigger.create({
    trigger: "body",
    start: "500px top",
    onEnter: () => gsap.to("#back-to-top", { opacity: 1, visibility: "visible", duration: 0.3 }),
    onLeaveBack: () => gsap.to("#back-to-top", { opacity: 0, visibility: "hidden", duration: 0.3 })
});

document.querySelector("#back-to-top").addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, {
        scrollTo: { y: 0, autoKill: false },
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: "auto"
    });
});