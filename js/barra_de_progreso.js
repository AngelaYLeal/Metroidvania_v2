
document.addEventListener("DOMContentLoaded", function() {

    const maxAmount = 5000;

    const amountElement = document.getElementById('current-amount');

    if (amountElement) {

        let currentAmount = parseFloat(amountElement.innerText.replace(',', ''));

        let percentage = (currentAmount / maxAmount) * 100;

        if (percentage > 100) percentage = 100;

        const progressBar = document.getElementById('funding-bar');

        setTimeout(() => {
            progressBar.style.width = percentage + '%';
        }, 300);

        amountElement.innerText = currentAmount.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
});

//Simular un aumento al hacer clic en donar????
function increaseFill() {
    // Aquí iría tu lógica real, pero para la demo visual:
    console.log("Iniciando proceso de donación...");
}