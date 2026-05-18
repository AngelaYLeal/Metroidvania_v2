// js/signup.js

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Escuchar Enter en el campo de Nombre de Usuario
    if (usernameInput) {
        usernameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                registrarUsuario();
            }
        });
    }

    // Escuchar Enter en el campo de Contraseña
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                registrarUsuario();
            }
        });
    }
});

async function registrarUsuario() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const btn = document.querySelector('button[onclick="registrarUsuario()"]');

    if (!usernameInput || !passwordInput) {
        alert("Por favor, rellena todos los parámetros exigidos.");
        return;
    }

    if (passwordInput.length < 6) {
        alert("La contraseña debe contener al menos 6 caracteres.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Registrando Huella Digital...';

    try {
        const result = await dbPerfiles.allDocs({ include_docs: true });

        // Comprobar disponibilidad del nombre de usuario
        const usuarioExiste = result.rows.some(row =>
            row.doc.username && row.doc.username.toLowerCase() === usernameInput.toLowerCase()
        );

        if (usuarioExiste) {
            throw new Error("Ese nombre de operador ya está ocupado en la red.");
        }

        // Generar nuevo documento de perfil limpio sin emails
        const nuevoUsuario = {
            _id: 'user_' + new Date().getTime().toString(),
            username: usernameInput,
            password: passwordInput,
            categoria: 'usuario',
            avatar_url: "assets/img/logos/Logo_sin_fondo.png"
        };

        await dbPerfiles.put(nuevoUsuario);

        // Auto-login automático tras registrarse exitosamente
        const sessionUser = {
            id: nuevoUsuario._id,
            username: nuevoUsuario.username
        };
        localStorage.setItem('session_user', JSON.stringify(sessionUser));

        alert(`¡Registro completado! Bienvenido, Operador ${usernameInput}.`);
        window.location.href = 'comments.html';

    } catch (error) {
        alert("Fallo en la creación de cuenta: " + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Iniciar Registro';
    }
}