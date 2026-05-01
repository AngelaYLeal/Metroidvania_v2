async function actualizarNavbar(user) {
    const navRight = document.getElementById('nav-right-actions');
    if (!navRight) return;

    if (user) {
        // 1. Si hay usuario, buscamos su perfil para el avatar
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        const imgPath = perfil?.avatar_url ? perfil.avatar_url : 'assets/img/icons/no_img.jpg';

        // 2. Contenido para LOGUEADO: Reservar + Avatar + Logout
        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-black fw-normal me-3" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
            <li class="nav-item me-3">
                <a href="profile.html" class="d-flex align-items-center text-decoration-none">
                    <div class="avatar-frame shadow-sm border border-info rounded-circle" style="width: 35px; height: 35px; overflow: hidden;">
                        <img src="${imgPath}" alt="Avatar" class="nav-avatar" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </a>
            </li>
            <li class="nav-item">
                <button onclick="ejecutarLogout()" class="btn btn-link nav-link text-danger p-0" title="Cerrar Sesión">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </li>
        `;
    } else {
        // 3. Contenido para NO LOGUEADO: Login + Sign Up + Reservar
        navRight.innerHTML = `
            <li class="nav-item"><a class="nav-link text-white fw-light me-2" href="log_in.html">LOGIN</a></li>
            <li class="nav-item"><a class="nav-link text-info fw-light me-3" href="sign_up.html">SIGN UP</a></li>
            <li class="nav-item"><a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a></li>
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

// window.onload
window.onload = async () => {
    const currentUser = await checkSession();

    actualizarNavbar(currentUser);

    if (typeof gestionarInterfazUsuario === "function") gestionarInterfazUsuario();
    if (typeof cargarComentarios === "function") cargarComentarios();
};