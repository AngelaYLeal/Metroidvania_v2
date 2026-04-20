const launchDate = new Date("Dec 23, 2026 12:00:00").getTime();

    const updateCountdown = setInterval(function() {
        const now = new Date().getTime();
        const diff = launchDate - now;

        // Cálculos de tiempo
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Insertar en el HTML (con ceros a la izquierda si es < 10)
        document.getElementById("days").innerText = d < 10 ? "0" + d : d;
        document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
        document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
        document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;

        // Si el tiempo termina
        if (diff < 0) {
            clearInterval(updateCountdown);
            document.getElementById("countdown").innerHTML = "<h3 class='text-danger'>¡SISTEMA EN LÍNEA - LANZADO!</h3>";
        }
    }, 1000);

