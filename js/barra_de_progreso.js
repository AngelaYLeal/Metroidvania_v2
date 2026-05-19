// js/barra_de_progreso.js

let pendingDonation = { tier: '', amount: 0 };
const MAX_AMOUNT = 20000;
const BASE_AMOUNT = 5000;

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
        const result = await dbDonaciones.allDocs({ include_docs: true });

        if (result && result.rows) {

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

        setTimeout(() => {
            progressBar.style.width = percentage + '%';
            if (percentageLabel) percentageLabel.innerText = Math.floor(percentage) + '%';
        }, 400);

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

    const donationData = {
        _id: 'donacion_' + new Date().getTime().toString(),
        tier_name: tier,
        amount: parseFloat(amount),
        created_at: new Date().toISOString()
    };


    if (userId) {
        donationData.user_id = userId;
    }

    try {

        await dbDonaciones.put(donationData);

        const successModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
        successModal.show();

        updateProgressBar();

    } catch (err) {
        console.error("Fallo de almacenamiento en el búnker local de PouchDB:", err);
        alert("Error al registrar la contribución localmente en los sistemas de memoria.");
    }
}