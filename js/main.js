// ⬇️ ¡IMPORTANTE! Reemplaza esta URL con tu "Test URL" de n8n
const N8N_WEBHOOK_URL = 'https://jeztorres8.app.n8n.cloud/webhook/calculadora-ia'; 

const operacionInput = document.getElementById('operacionInput');
const calcularBtn = document.getElementById('calcularBtn');
const resultadoSpan = document.getElementById('resultadoSpan');
const resultadoContenedor = document.getElementById('resultadoContenedor');

calcularBtn.addEventListener('click', async () => {
    let operacion = operacionInput.value.trim();
    if (!operacion) {
        showError('Por favor, escribe una operación matemática.');
        return;
    }

    // 🔵 NORMALIZACIÓN COMPLETA (símbolos raros + raíces)
    let op = operacion
        .replace(/–/g, "-")     // guion largo
        .replace(/−/g, "-")     // guion unicode
        .replace(/﹣/g, "-")    // guion raro
        .replace(/×/g, "*")
        .replace(/x/gi, "*")
        .replace(/＊/g, "*")
        .replace(/÷/g, "/")
        .replace(/／/g, "/")
        .replace(/﹢/g, "+")
        .replace(/％/g, "%")
        .replace(/　/g, " ")

        // 🔵 Normalizar raíces escritas
        .replace(/sqrt\(/gi, "Math.sqrt(")
        .replace(/raiz\(/gi, "Math.sqrt(")
        .replace(/raíz\(/gi, "Math.sqrt(")

        // 🔵 Convertir "√9" → "Math.sqrt(9)"
        .replace(/√\s*(\d+(\.\d+)?)/g, "Math.sqrt($1)")

        // 🔵 Convertir "√(9)" → "Math.sqrt(9)"
        .replace(/√\s*\(/g, "Math.sqrt(")

        .trim();

    // 🔵 Calcular operación en el navegador (sin IA)
    let resultadoReal;

    try {
        resultadoReal = Function(`return (${op})`)();

        if (isNaN(resultadoReal) || resultadoReal === Infinity || resultadoReal === -Infinity) {
            throw new Error("Operación inválida");
        }

        // 🔵 Truncar SOLO si tiene decimales
        if (Number.isInteger(resultadoReal)) {
            resultadoReal = resultadoReal.toString();
        } else {
            const truncado = Math.floor(resultadoReal * 1000) / 1000;
            resultadoReal = truncado.toFixed(3);
        }

    } catch {
        showError("Operación inválida.");
        setLoadingState(false);
        return;
    }

    // Mostrar resultado inmediato
    showResult();
    showSuccess(resultadoReal);

    // 🔵 Enviar datos a n8n (operación + resultado)
    try {
        setLoadingState(true);

        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operacion: operacion,
                resultado: resultadoReal
            })
        });

    } catch (error) {
        console.error('Hubo un error:', error);
        showError('Error al enviar datos a n8n.');
    } finally {
        setLoadingState(false);
    }
});


// ---------------- FUNCIONES DE UI ---------------- //

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
    
    const resultLength = resultado.toString().length;
    if (resultLength > 15) {
        resultadoSpan.style.fontSize = '1.25rem';
    } else if (resultLength > 10) {
        resultadoSpan.style.fontSize = '1.75rem';
    } else if (resultLength > 6) {
        resultadoSpan.style.fontSize = '2rem';
    } else {
        resultadoSpan.style.fontSize = '2.5rem';
    }
}

function showError(mensaje) {
    resultadoContenedor.style.display = 'block';
    resultadoContenedor.classList.add('error');
    resultadoSpan.textContent = mensaje;
}

operacionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !calcularBtn.disabled) {
        calcularBtn.click();
    }
});

operacionInput.addEventListener('input', () => {
    if (resultadoContenedor.classList.contains('error')) {
        resultadoContenedor.style.display = 'none';
        resultadoContenedor.classList.remove('error');
    }
});
