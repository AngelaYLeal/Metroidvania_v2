const db = supabaseClient;

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

async function updateProgressBar() {
    // Consulta usando el cliente correcto
    const { data, error } = await db.from('donations').select('amount');

    let totalDonated = BASE_AMOUNT;
    if (data && !error) {
        totalDonated += data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
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

async function initiateDonation(tier, amount) {
    if (!amount || amount <= 0) {
        alert("Por favor, introduce una cantidad válida.");
        return;
    }

    pendingDonation.tier = tier;
    pendingDonation.amount = parseFloat(amount);

    // Usamos el método de sesión de tu database.js
    const user = await checkSession();

    if (user) {
        await processDonation(pendingDonation.tier, pendingDonation.amount, user.id);
    } else {
        const authModal = new bootstrap.Modal(document.getElementById('donationAuthModal'));
        authModal.show();
    }
}

async function processDonation(tier, amount, userId) {
    // Construimos el objeto respetando tus columnas: tier_name y amount
    const donationData = {
        tier_name: tier,
        amount: parseFloat(amount)
    };

    // Si el usuario está logueado, añadimos el user_id
    if (userId) {
        donationData.user_id = userId;
    }

    // Insertamos en la tabla 'donations'
    const { error } = await supabaseClient.from('donations').insert([donationData]);

    if (error) {
        console.error("Error en Supabase:", error.message);
        alert("Error al registrar la contribución: " + error.message);
    } else {
        // Lanzamos el modal de éxito (id en tu HTML)
        const successModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
        successModal.show();

        // Actualizamos la barra visualmente sin recargar
        updateProgressBar();
    }
}