// js/signup.js

// Al cargar la ventana, se carga el el escuchador al formulario
window.onload = () => {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', registrarUsuario);
    }
};

async function registrarUsuario(event) {

    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    // selección de forma dinámica el botón submit dentro del formulario activo
    const btn = event.target.querySelector('button[type="submit"]');

    if (!email || !password || !username) {
        alert("Por favor, completa todos los campos de sincronización.");
        return;
    }

    // Feedback visual adaptado a la estética de la app
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Sincronizando...';

    try {
        // Registro de autenticación en Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        // Si el usuario se creó correctamente, inserto sus datos adicionales en la tabla perfiles
        if (data.user) {
            const { error: profileError } = await supabaseClient
                .from('perfiles')
                .insert([
                    { id: data.user.id, username: username }
                ]);

            if (profileError) throw profileError;

            alert("Registro exitoso. Se ha enviado un correo de confirmación (revisa SPAM).");
            window.location.href = 'log_in.html';
        }
    } catch (error) {
        alert("Error en el sistema: " + error.message);

        // resutaurar el botón a su estado original si ocurre un fallo
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Iniciar Registro';
    }
}