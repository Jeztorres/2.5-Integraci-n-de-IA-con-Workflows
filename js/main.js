// ⬇️ ¡IMPORTANTE! Reemplaza esta URL con tu "Test URL" de n8n
const N8N_WEBHOOK_URL = 'https://jeztorres.app.n8n.cloud/webhook/calculadora-ia'; 

const operacionInput = document.getElementById('operacionInput');
const calcularBtn = document.getElementById('calcularBtn');
const resultadoSpan = document.getElementById('resultadoSpan');
const resultadoContenedor = document.getElementById('resultadoContenedor');

calcularBtn.addEventListener('click', async () => {
    const operacion = operacionInput.value.trim();
    if (!operacion) {
        showError('Por favor, escribe una operación matemática.');
        return;
    }

    // Deshabilitar botón y mostrar estado de carga
    setLoadingState(true);
    showResult();

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Enviamos el JSON que el nodo Gemini espera
            body: JSON.stringify({
                operacion: operacion 
            })
        });

        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }

        // n8n nos devuelve el JSON del nodo "Set"
        const data = await response.json(); 
        
        // Mostrar el resultado
        showSuccess(data.resultado);

    } catch (error) {
        console.error('Hubo un error:', error);
        showError('Error al procesar la operación. Inténtalo de nuevo.');
    } finally {
        // Rehabilitar el botón
        setLoadingState(false);
    }
});

// Funciones auxiliares para mejorar la UX
function setLoadingState(isLoading) {
    calcularBtn.disabled = isLoading;
    const buttonText = calcularBtn.querySelector('.button-text');
    
    if (isLoading) {
        buttonText.innerHTML = '<div class="spinner"></div> Calculando...';
    } else {
        buttonText.innerHTML = '✨ Calcular con IA';
    }
}

function showResult() {
    resultadoContenedor.style.display = 'block';
    resultadoContenedor.classList.remove('error');
    resultadoSpan.textContent = '...';
}

function showSuccess(resultado) {
    resultadoContenedor.classList.remove('error');
    resultadoSpan.textContent = resultado;
}

function showError(mensaje) {
    resultadoContenedor.style.display = 'block';
    resultadoContenedor.classList.add('error');
    resultadoSpan.textContent = mensaje;
}

// Permitir envío con Enter
operacionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !calcularBtn.disabled) {
        calcularBtn.click();
    }
});

// Limpiar errores cuando el usuario empiece a escribir
operacionInput.addEventListener('input', () => {
    if (resultadoContenedor.classList.contains('error')) {
        resultadoContenedor.style.display = 'none';
        resultadoContenedor.classList.remove('error');
    }
});