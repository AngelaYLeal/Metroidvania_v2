// Función para actualizar el Navbar según el estado de la sesión
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

        // 2. Definimos la imagen (avatar o default)
        const imgPath = perfil?.avatar_url ? perfil.avatar_url : 'assets/img/icons/no_img.jpg';

        // 3. Cambiamos el contenido de la derecha
        navRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link text-black fw-normal me-3" id="reservar" href="Reserve.html">RESERVAR</a>
            </li>
            <li class="nav-item">
                <a href="profile.html" class="d-flex align-items-center text-decoration-none">
                    <div class="avatar-frame shadow-sm">
                        <img src="${imgPath}" alt="Avatar" class="nav-avatar">
                    </div>
                </a>
            </li>
        `;
    } else {
        // 4. Si no hay usuario, mostramos Login y Reservar
        navRight.innerHTML = `
            <li class="nav-item"><a class="nav-link text-white fw-light me-3" href="log_in.html">LOGIN</a></li>
            <li class="nav-item"><a class="nav-link text-black fw-normal" id="reservar" href="Reserve.html">RESERVAR</a></li>
        `;
    }
}

// Modifica tu window.onload actual para incluir la actualización del navbar
window.onload = async () => {
    currentUser = await checkSession();

    // Actualizamos el Navbar globalmente
    actualizarNavbar(currentUser);

    // Funciones específicas de la página de comentarios
    if (typeof gestionarInterfazUsuario === "function") gestionarInterfazUsuario();
    if (typeof cargarComentarios === "function") cargarComentarios();
};