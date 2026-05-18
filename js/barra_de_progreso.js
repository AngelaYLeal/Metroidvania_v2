// js/barra_de_progreso.js

let pendingDonation = { tier: '', amount: 0 };
const MAX_AMOUNT = 20000;
const BASE_AMOUNT = 5000; // Tus datos históricos iniciales se sumarán a esta base cibernética

document.addEventListener("DOMContentLoaded", () => {
    updateProgressBar();

    const btnAnon = document.getElementById('btn-anon-donate');
    if (btnAnon) {
        btnAnon.onclick = () => {
            const modalEl = document.getElementById('donationAuthModal');
            const authModal = bootstrap.Modal.getInstance(modalEl);
            if (authModal) authModal.hide();
            processDonation(pendingDonation.tier, pendingDonation.amount, null);
        };
    }
});

// --- ACTUALIZAR LA BARRA LEYENDO DE POUCHDB ---
async function updateProgressBar() {
    let totalDonated = BASE_AMOUNT;

    try {
        // Consultamos todos los documentos de donaciones en el búnker local
        const result = await dbDonaciones.allDocs({ include_docs: true });

        if (result && result.rows) {
            // Sumamos los montos locales usando el campo exacto 'amount'
            const totalLocal = result.rows.reduce((acc, row) => {
                const monto = row.doc && row.doc.amount ? parseFloat(row.doc.amount) : 0;
                return acc + monto;
            }, 0);

            totalDonated += totalLocal;
        }
    } catch (err) {
        console.error("Error al consultar donaciones en PouchDB:", err);
    }

    const amountElement = document.getElementById('current-amount');
    const progressBar = document.getElementById('funding-bar');
    const percentageLabel = document.getElementById('percentage-label');

    if (amountElement && progressBar) {
        let percentage = (totalDonated / MAX_AMOUNT) * 100;
        if (percentage > 100) percentage = 100;

        // Mantenemos tu genial retraso visual para la animación de carga neón
        setTimeout(() => {
            progressBar.style.width = percentage + '%';
            if (percentageLabel) percentageLabel.innerText = Math.floor(percentage) + '%';
        }, 400);

        // Formato de moneda europea limpio
        amountElement.innerText = totalDonated.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

// --- INICIAR EL PROCESO DE CONTRIBUCIÓN ---
async function initiateDonation(tier, amount) {
    if (!amount || amount <= 0) {
        alert("Por favor, introduce una cantidad válida.");
        return;
    }

    pendingDonation.tier = tier;
    pendingDonation.amount = parseFloat(amount);

    // checkSession() ya está definida de forma global en tu pouchDB.js
    const user = await checkSession();

    if (user) {
        await processDonation(pendingDonation.tier, pendingDonation.amount, user.id);
    } else {
        const authModal = new bootstrap.Modal(document.getElementById('donationAuthModal'));
        authModal.show();
    }
}

// --- GUARDAR LA NUEVA DONACIÓN EN POUCHDB ---
async function processDonation(tier, amount, userId) {
    // Estructuramos el nuevo documento con la misma forma que tus datos de initial_data.js
    const donationData = {
        _id: 'donacion_' + new Date().getTime().toString(), // PouchDB necesita un campo único ID obligatoriamente
        tier_name: tier,
        amount: parseFloat(amount),
        created_at: new Date().toISOString()
    };

    // Si el usuario simulado está logueado, le asociamos su UUID de perfil
    if (userId) {
        donationData.user_id = userId;
    }

    try {
        // En lugar de .insert() de Supabase, usamos .put() de PouchDB
        await dbDonaciones.put(donationData);

        // Lanzamos el modal de agradecimiento de Bootstrap que ya tenías maquetado
        const successModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
        successModal.show();

        // Refrescamos inmediatamente el cálculo de la barra en la interfaz
        updateProgressBar();

    } catch (err) {
        console.error("Fallo de almacenamiento en el búnker local de PouchDB:", err);
        alert("Error al registrar la contribución localmente en los sistemas de memoria.");
    }
}