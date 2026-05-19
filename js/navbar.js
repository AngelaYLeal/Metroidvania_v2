// js/navbar.js

async function actualizarNavbar(user) {
    const navRight = document.getElementById('nav-right-actions');
    if (!navRight) return;

    // Si hay un usuario con sesión activa en el búnker local
    if (user) {
        // si hay/detecta un user === > get user
        const datosUsuario = await getUserFullStatus(user.id);

        const imgPath = 'assets/img/logos/Logo_sin_fondo.png';

        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
            <li class="nav-item">
                <a href="profile.html" class="d-flex align-items-center text-decoration-none" title="Operador: ${datosUsuario?.username || user.username}">
                    <div class="avatar-frame d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border: 1px solid #00ffff; border-radius: 50%; overflow: hidden; background: #000;">
                        <img src="${imgPath}" alt="Avatar" class="nav-avatar" style="width: 100%; height: auto; object-fit: cover;">
                    </div>
                    <span class="text-info small d-lg-none">${datosUsuario?.username || user.username}</span>
                </a>
            </li>
            <li class="nav-item">
                <button onclick="ejecutarLogout()" class="btn btn-link nav-link text-danger" style="border:none; background:none;" title="Desconectar del Sistema">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </li>
        `;
    } else {
        // Estructura para usuarios invitados
        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-white fw-light me-3" href="log_in.html">LOGIN</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-white fw-light me-3" href="sign_up.html">SIGN UP</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
        `;
    }

    // Refrescar el colapsable de Bootstrap para pantallas móviles
    const menuColapsable = document.getElementById('navbarSupportedContent');
    if (menuColapsable && typeof bootstrap !== 'undefined') {
        const bsCollapse = bootstrap.Collapse.getInstance(menuColapsable);
        if (bsCollapse) {
            bsCollapse.hide();
        }
    }
}

// Redirecciona y limpia el localStorage mediante pouchDB.js
function ejecutarLogout() {
    logout();
}

// FUNCIÓN PARA MANTENER EL HOVER DE LA PÁGINA ACTIVA (.active)
document.addEventListener("DOMContentLoaded", function() {
    // Obtiene el nombre del archivo actual de la URL
    const currentUrl = window.location.pathname.split("/").pop();


    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const hrefAttr = link.getAttribute('href');

        // Si el href coincide exactamente con la página cargada, se marca activa
        if (hrefAttr === currentUrl) {
            link.classList.add('active');
        }

        // Caso especial si el servidor abre la raíz vacía y estás parado en index.html
        if (currentUrl === "" && hrefAttr === "index.html") {
            link.classList.add('active');
        }
    });
});


window.onload = async () => {
    // 1.  la sesión mediante pouchDB.js?
    const currentUser = await checkSession();

    // 2.  botones correspondientes en el Navbar
    await actualizarNavbar(currentUser);

    // 3.
    if (typeof gestionarInterfazUsuario === "function") gestionarInterfazUsuario();
    // Nota: El llamado directo a cargarComentarios() aquí se remueve si ya es ejecutado internamente por su propio comments.js
};