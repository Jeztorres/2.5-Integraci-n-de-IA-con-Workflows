document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Selecciona todos los elementos del DOM ---
    const form = document.getElementById('calculator-form');
    const input = document.getElementById('operation-input');
    const submitButton = document.getElementById('submit-button');
    const buttonText = document.getElementById('button-text');
    const buttonSpinner = document.getElementById('button-spinner');
    const resultBox = document.getElementById('result-box');
    const resultValue = document.getElementById('result-value');

    // --- ¡URL de Producción ACTUALIZADA! ---
    const WEBHOOK_URL = 'https://jeztorres.app.n8n.cloud/webhook/7cf6c53c-0edb-4938-b7e5-a6ea455ecd27';


    // --- 2. Escucha el evento 'submit' del formulario ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const operacion = input.value;
        if (!operacion) return; // No hace nada si el campo está vacío

        // --- 3. Muestra el estado de carga ---
        setLoading(true);

        try {
            // --- 4. Llama al Webhook de n8n ---
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operacion: operacion })
            });

            // Si n8n responde con un error (ej. 500)
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // Convierte la respuesta a JSON
            const data = await response.json();

            // --- 5. Muestra el resultado exitoso ---
            // Asegúrate de que n8n devuelve {"resultado": ...}
            showResult(data.resultado);

        } catch (error) {
            console.error('Error al conectar con el webhook:', error);
            // --- 6. Muestra un mensaje de error ---
            showResult('Error al procesar la operación.', true);
        } finally {
            // --- 7. Restaura el botón ---
            setLoading(false);
        }
    });

    // --- Función para activar/desactivar la carga ---
    function setLoading(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            buttonText.style.display = 'none';
            buttonSpinner.style.display = 'block';
            resultBox.style.display = 'none'; // Oculta resultados anteriores
        } else {
            submitButton.disabled = false;
            buttonText.style.display = 'block';
            buttonSpinner.style.display = 'none';
        }
    }

    // --- Función para mostrar el resultado (o un error) ---
    function showResult(message, isError = false) {
        resultValue.textContent = message;
        
        if (isError) {
            resultBox.classList.add('error');
        } else {
            resultBox.classList.remove('error');
        }

        resultBox.style.display = 'block';
    }
});