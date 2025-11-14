// URL de tu webhook de n8n
// URL de tu webhook de n8n
const N8N_WEBHOOK_URL = "https://jeztorres8.app.n8n.cloud/webhook/calculadora-ia";

const operacionInput = document.getElementById('operacionInput');
const calcularBtn = document.getElementById('calcularBtn');
const resultadoSpan = document.getElementById('resultadoSpan');
const resultadoContenedor = document.getElementById('resultadoContenedor');

// Evento principal
calcularBtn.addEventListener('click', async () => {
    const operacion = operacionInput.value.trim();

    if (!operacion) {
        showError("Por favor escribe una operación.");
        return;
    }

    setLoadingState(true);
    resultadoContenedor.style.display = "block";
    resultadoSpan.textContent = "...";

    try {
        // PETICIÓN A n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                operacion: operacion
            }),
        });

        if (!response.ok) {
            throw new Error("Error de red con n8n");
        }

        const data = await response.json();

        if (!data.resultado) {
            showError("Error en la operación.");
            setLoadingState(false);
            return;
        }

        // Mostrar resultado limpio
        showSuccess(data.resultado);

    } catch (err) {
        console.error(err);
        showError("No se pudo procesar la operación.");
    }

    setLoadingState(false);
});

/* =======================
      FUNCIONES UI
======================= */

function setLoadingState(isLoading) {
    calcularBtn.disabled = isLoading;
    const buttonText = calcularBtn.querySelector('.button-text');

    if (isLoading) {
        buttonText.innerHTML = '<div class="spinner"></div> Calculando...';
    } else {
        buttonText.innerHTML = '✨ Calcular con IA';
    }
}

function showSuccess(resultado) {
    resultadoContenedor.classList.remove("error");
    resultadoSpan.textContent = resultado;

    // Ajuste automático del tamaño
    const length = resultado.toString().length;

    if (length > 15) resultadoSpan.style.fontSize = "1.25rem";
    else if (length > 10) resultadoSpan.style.fontSize = "1.75rem";
    else if (length > 6) resultadoSpan.style.fontSize = "2rem";
    else resultadoSpan.style.fontSize = "2.5rem";
}

function showError(msg) {
    resultadoContenedor.classList.add("error");
    resultadoSpan.textContent = msg;
}

// Enter para enviar
operacionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !calcularBtn.disabled) {
        calcularBtn.click();
    }
});

// Limpia error cuando escribe
operacionInput.addEventListener("input", () => {
    if (resultadoContenedor.classList.contains("error")) {
        resultadoContenedor.style.display = "none";
        resultadoContenedor.classList.remove("error");
    }
});
