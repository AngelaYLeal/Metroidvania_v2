// js/login.js

// 1. Al cargar la página, comprueba sesión y activa el escuchador del formulario
window.onload = async () => {
    //  si existe la función checkSession antes de ejecutarla? 0 :
    if (typeof checkSession === 'function') {
        const user = await checkSession();
        if (user) {
            window.location.href = 'profile.html';
            return; // Detiene la ejecución si ya está logueado
        }
    }

    //'submit' del formulario
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', iniciarSesion);
    }
};

// 2. Función de inicio de sesión
async function iniciarSesion(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Selecciona el botón dentro del formulario que disparó el evento
    const btn = event.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        alert("Por favor, introduce tus credenciales de acceso.");
        return;
    }

    // Feedback visual de "Cargando..."
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Verificando...';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            console.log("Sesión iniciada para:", data.user.email);
            window.location.href = 'profile.html';
        }
    } catch (error) {
        alert("Acceso denegado: " + error.message);
        // Restauramos el botón si la autenticación falla
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i>Verificar Identidad';
    }
}