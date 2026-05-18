// js/login.js

document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        try {
            const user = await checkSession();
            if (user) {
                window.location.href = 'profile.html';
            }
        } catch(e) {
            console.log("No hay sesión iniciada en el búnker.");
        }
    }, 100);

    // --- NUEVO: ESCUCHADORES PARA LA TECLA ENTER ---
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Si el usuario pulsa Enter en el campo de nombre de usuario
    if (usernameInput) {
        usernameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita comportamientos extraños del navegador
                iniciarSesion();
            }
        });
    }

    // Si el usuario pulsa Enter en el campo de contraseña
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                iniciarSesion();
            }
        });
    }
    // -----------------------------------------------
});

async function iniciarSesion() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const btn = document.querySelector('button[onclick="iniciarSesion()"]');

    if (!usernameInput || !passwordInput) {
        alert("Por favor, introduce tus credenciales de acceso.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Verificando en Búnker...';

    try {
        const result = await dbPerfiles.allDocs({ include_docs: true });

        // Buscamos ignorando mayúsculas/minúsculas en el login para mayor facilidad
        const usuarioEncontrado = result.rows.find(row =>
            row.doc.username && row.doc.username.toLowerCase() === usernameInput.toLowerCase()
        );

        if (!usuarioEncontrado) {
            throw new Error("El operador ingresado no consta en los registros.");
        }

        const userDoc = usuarioEncontrado.doc;

        if (userDoc.password !== passwordInput) {
            throw new Error("Clave de acceso incorrecta.");
        }

        const sessionUser = {
            id: userDoc._id,
            username: userDoc.username
        };

        localStorage.setItem('session_user', JSON.stringify(sessionUser));
        window.location.href = 'comments.html';

    } catch (error) {
        alert("Acceso denegado: " + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i>Verificar Identidad';
    }
}