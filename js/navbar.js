async function actualizarNavbar(user) {
    const navRight = document.getElementById('nav-right-actions');
    if (!navRight) return;

    if (user) {
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        const imgPath = perfil?.avatar_url ? perfil.avatar_url : 'assets/img/logos/Logo_sin_fondo.png';

        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
            <li class="nav-item ms-lg-2">
                <a href="profile.html" class="d-flex align-items-center">
                    <div class="avatar-frame">
                        <img src="${imgPath}" alt="Avatar" class="nav-avatar">
                    </div>
                </a>
            </li>
            <li class="nav-item">
                <button onclick="ejecutarLogout()" class="btn btn-link nav-link text-danger">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </li>
        `;
    } else {
        // Usamos iconos + texto con clase ocultable
        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-white" href="log_in.html">
                    <div class="user-icon-frame d-lg-flex d-none d-xl-none">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <span class="nav-text-hide">LOGIN</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-info" href="sign_up.html">
                    <span class="nav-text-hide">SIGN UP</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
        `;
    }
}
// FUNCION PARA TENER EL HOVER ACTIVO
document.addEventListener("DOMContentLoaded", function() {
    // Obtiene la URL actual
    const currentUrl = window.location.pathname.split("/").pop();

    // Selecciona todos los enlaces del navbar
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        // Si el href del enlace coincide con la página actual, añade .active
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }

        // Manejo especial para la página de inicio vacía
        if (currentUrl === "" && link.getAttribute('href') === "index.html") {
            link.classList.add('active');
        }
    });
});

// Función cierre de sesión
async function ejecutarLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    } else {
        // Redirigir a inicio o recargar para limpiar el estado
        window.location.href = 'index.html';
    }
}

async function inicializarNavbar() {
    const currentUser = await checkSession();
    actualizarNavbar(currentUser);

    if (typeof gestionarInterfazUsuario === "function") gestionarInterfazUsuario();
    if (typeof cargarComentarios === "function") cargarComentarios();
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarNavbar();
});