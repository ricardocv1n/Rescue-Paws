document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const donationForm = document.getElementById('donation-form');
    const amountOptions = document.querySelectorAll('.amount-option');
    const amountInput = document.getElementById('amount');
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentContents = document.querySelectorAll('.payment-content');
    const cancelBtn = document.querySelector('.btn-cancel');
    const modal = document.getElementById('donation-modal');
    const closeModal = document.querySelector('.close-modal');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const applePayButton = document.querySelector('.apple-pay-button');
    const notificationContainer = document.getElementById('app-notification'); // Contenedor para notificaciones

    // Nuevos elementos para PayPal y PSE
    const paypalButton = document.getElementById('paypal-button');
    const pseButton = document.getElementById('pse-button');
    const pseBankSelect = document.getElementById('pse-bank');

    // Inicialización
    initAmountButtons();
    initPaymentTabs();
    initProgressCircles();
    initMobileMenu();
    setupFormValidation();
    setupApplePay(); // Esto ya está en tu código, asumimos que manejará la lógica de Apple Pay.

    // Event Listeners
    if (cancelBtn) cancelBtn.addEventListener('click', resetForm);
    if (closeModal) closeModal.addEventListener('click', closeDonationModal);
    if (modal) modal.addEventListener('click', closeModalOnOverlayClick);
    if (applePayButton) applePayButton.addEventListener('click', handleApplePay);
    // El submit del formulario principal solo se usa para la pestaña de Tarjeta de Crédito
    if (donationForm) donationForm.addEventListener('submit', handleDonationSubmit); 
    if (paypalButton) paypalButton.addEventListener('click', handlePayPalDonation); // Nuevo: para PayPal
    if (pseButton) pseButton.addEventListener('click', handlePSEDonation);     // Nuevo: para PSE

    // Funciones de inicialización
    function initAmountButtons() {
        amountOptions.forEach(option => {
            option.addEventListener('click', function() {
                amountOptions.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                // Si el botón es "Otro monto", el input ya debe estar seleccionado por su propio listener
                // Si es un monto predefinido, asignamos su valor al input
                if (this.dataset.amount !== 'custom') {
                    amountInput.value = this.dataset.amount;
                } else {
                    // Si se selecciona "Otro monto", vaciamos el input para que el usuario escriba
                    amountInput.value = '';
                }
                // Desactivar temporalmente la validación del input para que no muestre error al vaciarlo
                amountInput.dataset.isValid = 'true';
                document.getElementById('amount').closest('.form-group').classList.remove('error');
                document.getElementById('amount').closest('.form-group').querySelector('.error-message').textContent = '';
            });
        });

        // Manejar la selección del input personalizado
        amountInput.addEventListener('focus', function() {
            amountOptions.forEach(btn => btn.classList.remove('selected'));
            document.getElementById('custom-amount').classList.add('selected');
        });
        // Si el usuario escribe en el input personalizado y no hay un botón de cantidad exacta,
        // aseguramos que el input personalizado esté seleccionado
        amountInput.addEventListener('input', function() {
            // Eliminar la clase 'selected' de todos los botones predefinidos
            amountOptions.forEach(btn => {
                if (btn.dataset.amount !== 'custom') {
                    btn.classList.remove('selected');
                }
            });

            if (!this.value || parseFloat(this.value) <= 0) {
                 // Si está vacío o es cero/negativo, deseleccionar 'Otro monto' también
                 document.getElementById('custom-amount')?.classList.remove('selected');
            } else {
                 // Si hay un valor, seleccionar 'Otro monto'
                 document.getElementById('custom-amount')?.classList.add('selected');
            }
            validateField(this); // Validar el monto mientras se escribe
        });
    }

    function initPaymentTabs() {
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                paymentTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const targetId = this.dataset.tab;
                paymentContents.forEach(content => {
                    // Asegúrate de que el ID del contenido coincida con el data-tab + '-content'
                    content.classList.toggle('active', content.id === `${targetId}-content`);
                });
            });
        });
    }

    function initProgressCircles() {
        const progressCircles = document.querySelectorAll('.progress-circle');
        progressCircles.forEach(circle => {
            const current = circle.dataset.current;
            const target = circle.dataset.target;
            const percentage = (current / target) * 100;
            const dashOffset = 283 - (283 * percentage / 100); // 2 * PI * R (R=45, C=282.7)
            circle.querySelector('.progress-bar').style.strokeDashoffset = dashOffset;
            circle.querySelector('.progress-text').textContent = `${percentage.toFixed(0)}%`;
        });
    }

    function initMobileMenu() {
        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', function() {
                mainNav.classList.toggle('active');
                this.classList.toggle('active'); // Opcional: para cambiar el icono del botón
            });
        }
    }

    // --- Funciones de Validación de Formulario ---
    function validateField(input) {
        const parentGroup = input.closest('.form-group');
        const errorMessageElement = parentGroup ? parentGroup.querySelector('.error-message') : null;
        let isValid = true;
        let message = '';

        // Resetear estado de error visualmente antes de la nueva validación
        if (parentGroup) {
            parentGroup.classList.remove('error');
            if (errorMessageElement) errorMessageElement.textContent = '';
        }

        if (input.required && input.value.trim() === '') {
            isValid = false;
            message = 'Este campo es obligatorio.';
        } else {
            switch (input.id) {
                case 'full-name':
                    if (input.value.trim().length < 3) {
                        isValid = false;
                        message = 'El nombre completo debe tener al menos 3 caracteres.';
                    }
                    break;
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                        isValid = false;
                        message = 'Ingrese un correo electrónico válido.';
                    }
                    break;
                case 'amount':
                    const amount = parseFloat(input.value);
                    if (isNaN(amount) || amount <= 0) {
                        isValid = false;
                        message = 'Ingrese una cantidad válida mayor que cero.';
                    }
                    break;
                case 'card-number':
                    // Validación básica de 16 dígitos para demostración
                    if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(input.value.replace(/\s/g, ''))) {
                        isValid = false;
                        message = 'Número de tarjeta inválido (16 dígitos).';
                    }
                    break;
                case 'card-expiry':
                    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(input.value)) {
                        isValid = false;
                        message = 'Formato MM/AA inválido.';
                    } else {
                        const [month, year] = input.value.split('/');
                        const currentYear = new Date().getFullYear() % 100; // Últimos 2 dígitos
                        const currentMonth = new Date().getMonth() + 1; // Enero es 0

                        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                            isValid = false;
                            message = 'Tarjeta expirada.';
                        }
                    }
                    break;
                case 'card-cvc':
                    if (!/^\d{3,4}$/.test(input.value)) {
                        isValid = false;
                        message = 'CVC inválido (3 o 4 dígitos).';
                    }
                    break;
                 case 'country':
                    if (input.value === '') {
                        isValid = false;
                        message = 'Por favor, selecciona un país.';
                    }
                    break;
                case 'pse-bank': // Nueva validación para el banco PSE
                    if (input.value === '') {
                        isValid = false;
                        message = 'Por favor, selecciona un banco.';
                    }
                    break;
            }
        }

        if (parentGroup && errorMessageElement) {
            if (!isValid) {
                parentGroup.classList.add('error');
                errorMessageElement.textContent = message;
            } else {
                parentGroup.classList.remove('error');
                errorMessageElement.textContent = '';
            }
        }
        return isValid;
    }

    function setupFormValidation() {
        // Añadir listeners para validación en tiempo real en los campos principales
        const inputsToValidate = donationForm.querySelectorAll('input[required], select[required], textarea[required]');
        inputsToValidate.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
            });
            input.addEventListener('blur', function() { // Validar al salir del campo
                validateField(this);
            });
        });

        // Asegurarse de que el PSE Bank también tenga validación
        if (pseBankSelect) {
            pseBankSelect.addEventListener('change', function() {
                validateField(this);
            });
            pseBankSelect.addEventListener('blur', function() {
                validateField(this);
            });
        }
    }

    // --- Lógica de Manejo de Donación y Modal ---
    function handleDonationSubmit(event) {
        event.preventDefault(); // Evitar el envío por defecto del formulario

        // Validar campos generales (nombre, email, monto, país)
        let formValid = true;
        const generalInputs = donationForm.querySelectorAll('#full-name, #email, #amount, #country');
        generalInputs.forEach(input => {
            if (!validateField(input)) {
                formValid = false;
            }
        });

        // Validar campos específicos de la tarjeta de crédito si la pestaña está activa
        const activePaymentTab = document.querySelector('.payment-tab.active');
        if (activePaymentTab && activePaymentTab.dataset.tab === 'credit-card') {
            const cardInputs = document.querySelectorAll('#credit-card-content input[required]');
            cardInputs.forEach(input => {
                if (!validateField(input)) {
                    formValid = false;
                }
            });
        }
        // Para PayPal, PSE y Apple Pay, la validación de sus campos específicos
        // (como el banco para PSE) se maneja dentro de sus funciones de `handle...Donation`.

        if (!formValid) {
            showNotification('Por favor, corrige los errores en el formulario.', 'error');
            return; // Detener el proceso si hay errores generales o de tarjeta de crédito
        }

        // Si se llega aquí, los campos generales y de tarjeta (si aplica) son válidos.
        // La simulación de pago para tarjeta se dispara desde aquí.
        // Para PayPal y PSE, la simulación se dispara desde sus respectivos botones.
        
        // Disparar la simulación de pago para Tarjeta de Crédito
        if (activePaymentTab.dataset.tab === 'credit-card') {
            processPaymentSimulation();
        } else {
            // Si el formulario se envió por alguna razón sin pasar por los botones de PayPal/PSE/Apple Pay
            // y no es tarjeta de crédito, lo manejamos como un caso inesperado o se ignora si no hay submit explícito.
            // Los botones de PayPal/PSE/Apple Pay tienen sus propios event listeners para disparar la simulación.
        }
    }

    // Nueva función para manejar donación con PayPal
    function handlePayPalDonation() {
        // Validar campos generales antes de intentar PayPal
        let formValid = true;
        const generalInputs = donationForm.querySelectorAll('#full-name, #email, #amount, #country');
        generalInputs.forEach(input => {
            if (!validateField(input)) {
                formValid = false;
            }
        });
        if (!formValid) {
            showNotification('Por favor, corrige los errores en los campos generales (nombre, email, monto).', 'error');
            return;
        }

        showNotification('Redirigiendo a PayPal (simulado)...', 'info');
        processPaymentSimulation(); // Llama a la simulación de pago
    }

    // Nueva función para manejar donación con PSE
    function handlePSEDonation() {
        // Validar campos generales y el banco PSE antes de intentar PSE
        let formValid = true;
        const generalInputs = donationForm.querySelectorAll('#full-name, #email, #amount, #country');
        generalInputs.forEach(input => {
            if (!validateField(input)) {
                formValid = false;
            }
        });

        // Validar el campo de selección de banco PSE
        if (!validateField(pseBankSelect)) {
            formValid = false;
        }

        if (!formValid) {
            showNotification('Por favor, corrige los errores en los campos generales y selecciona tu banco.', 'error');
            return;
        }

        showNotification('Redirigiendo a PSE (simulado)...', 'info');
        processPaymentSimulation(); // Llama a la simulación de pago
    }

    // Función unificada para simular el proceso de pago
    function processPaymentSimulation() {
        simulatePayment()
            .then(() => {
                showNotification('Donación procesada con éxito!', 'success');
                showDonationModal(); // Mostrar el modal de agradecimiento
                resetForm(); // Limpiar el formulario después del éxito
            })
            .catch(error => {
                showNotification(`Error en la donación: ${error.message}`, 'error');
            });
    }

    function simulatePayment() {
        return new Promise((resolve, reject) => {
            // Simula una latencia de red de 1-3 segundos
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // 90% de éxito, 10% de fallo simulado
                if (isSuccess) {
                    resolve({ status: 'success', message: 'Pago aprobado.' });
                } else {
                    reject(new Error('Fondos insuficientes o transacción declinada.'));
                }
            }, Math.random() * 2000 + 1000); // entre 1 y 3 segundos
        });
    }

    function showDonationModal() {
        if (modal) {
            modal.style.display = 'flex'; // Cambia a 'flex' para centrarlo con CSS
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeDonationModal() {
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    function closeModalOnOverlayClick(event) {
        if (event.target === modal) {
            closeDonationModal();
        }
    }

    function resetForm() {
        if (donationForm) {
            donationForm.reset();
            amountOptions.forEach(btn => btn.classList.remove('selected'));
            document.getElementById('custom-amount')?.classList.remove('selected'); // Deseleccionar 'Otro Monto'
            
            // Asegurarse de que el primer tab de pago (Tarjeta de Crédito) esté activo al resetear
            paymentTabs.forEach((tab, index) => {
                if (index === 0) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            paymentContents.forEach((content, index) => {
                if (index === 0) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Limpiar errores visuales
            document.querySelectorAll('.form-group.error').forEach(group => {
                group.classList.remove('error');
                const errorMessage = group.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = '';
                }
            });
        }
    }

    // Función para mostrar notificaciones temporales
    function showNotification(message, type) {
        if (!notificationContainer) {
            console.warn('No se encontró el contenedor de notificaciones (app-notification).');
            return;
        }

        const notification = document.createElement('div');
        notification.classList.add('notification', type); // Clases 'notification' y 'success'/'error'/'info'
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        // Forzar reflow para la transición CSS
        void notification.offsetWidth;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000); // La notificación desaparecerá después de 3 segundos
    }

    // Formateo de inputs (Número de tarjeta, Fecha de vencimiento, CVC, Monto)
    document.getElementById('card-number')?.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '')
                              .replace(/(\d{4})(?=\d)/g, '$1 ')
                              .substring(0, 19);
    });

    document.getElementById('card-expiry')?.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '')
                              .replace(/^(\d{2})/, '$1/')
                              .substring(0, 5);
    });

    document.getElementById('card-cvc')?.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 4);
    });

    document.getElementById('amount')?.addEventListener('input', function(e) {
        // Permitir solo números y un punto
        let value = this.value.replace(/[^0-9.]/g, '');
        
        // Asegurarse de que solo haya un punto decimal
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        // Limitar a 2 decimales después del punto
        if (value.includes('.')) {
            const decimalPart = value.split('.')[1];
            if (decimalPart && decimalPart.length > 2) {
                value = value.split('.')[0] + '.' + decimalPart.substring(0, 2);
            }
        }
        this.value = value;
    });

    // Simulación básica de Apple Pay
    function setupApplePay() {
        // En un entorno real, aquí se verificaría la disponibilidad de Apple Pay
        // Para esta simulación, siempre lo mostraremos.
        if (applePayButton) {
            applePayButton.style.display = 'block'; // Mostrar el botón
        }
    }

    function handleApplePay() {
        // Validar campos generales antes de intentar Apple Pay
        let formValid = true;
        const generalInputs = donationForm.querySelectorAll('#full-name, #email, #amount, #country');
        generalInputs.forEach(input => {
            if (!validateField(input)) {
                formValid = false;
            }
        });
        if (!formValid) {
            showNotification('Por favor, corrige los errores en los campos generales (nombre, email, monto).', 'error');
            return;
        }

        showNotification('Iniciando Apple Pay...', 'info');
        processPaymentSimulation(); // Llama a la simulación de pago
    }
});
