document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navList: document.querySelector('.nav-list'),
        form: document.getElementById('adoption-form'),
        formSteps: document.querySelectorAll('.form-step'),
        progressFill: document.getElementById('progress-fill'),
        progressSteps: document.querySelectorAll('.step'),
        petOptions: document.querySelectorAll('.pet-option'),
        petDetails: document.querySelectorAll('.pet-details'),
        otherPetDetails: document.querySelector('.other-pet-details'),
        conditionalFields: document.querySelectorAll('.conditional'),
        petsGrid: document.getElementById('pets-grid'),
        confirmationModal: document.getElementById('confirmation-modal'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalOkBtn: document.getElementById('modal-close-btn'), // El botón "Entendido" usa el mismo ID
        personalSummary: document.getElementById('personal-summary'),
        homeSummary: document.getElementById('home-summary'),
        petSummary: document.getElementById('pet-summary')
    };

    // Estado del formulario
    let currentStep = 0;
    let formData = {};

    // Inicialización
    function init() {
        setupEventListeners();
        loadSavedData(); // Cargar datos antes de actualizar los pasos
        updateFormSteps();
        updateProgressBar();
        
        // Asegurarse de que los detalles de la mascota correcta se muestren al cargar si ya hay una selección
        if (formData.selectedPet) {
            updatePetDetails(formData.selectedPet);
        } else {
            // Por defecto, mostrar los detalles del perro si no hay selección guardada
            updatePetDetails('dog');
        }
        // Llamar a handleConditionalFields para inicializar la visibilidad de los campos condicionales
        handleConditionalFields();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Menú móvil
        if (elements.mobileMenuBtn && elements.navList) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Selección de mascota (perro, gato, otro)
        elements.petOptions.forEach(option => {
            option.addEventListener('click', function() {
                const petType = this.dataset.petType;
                selectPet(petType);
            });
        });

        // Navegación del formulario
        elements.form.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-next')) {
                handleNextStep();
            } else if (e.target.classList.contains('btn-prev')) {
                handlePrevStep();
            } else if (e.target.id === 'submit-request-btn') {
                e.preventDefault(); // Prevenir el envío por defecto para manejarlo con JS
                handleSubmitForm();
            }
        });

        // Validación en tiempo real y guardado de datos (más continuo)
        elements.form.addEventListener('input', function(e) {
            if (e.target.matches('input:not([type="radio"]):not([type="checkbox"]), select, textarea')) {
                validateField(e.target);
                saveFormData(); // Guardar datos al cambiar un campo
            }
        });
        
        elements.form.addEventListener('change', function(e) {
            if (e.target.matches('input[type="radio"], input[type="checkbox"], select')) {
                 validateField(e.target); // Re-validar en cambio para radios/checkboxes/selects
                 saveFormData(); // Guardar datos al cambiar un campo
            }
            // También manejar campos condicionales en el evento 'change'
            if (e.target.matches('input[name="current-pets"], select#housing-type, input[name="experience"]')) {
                handleConditionalFields();
            }
        });

        // Permitir clic en la barra de progreso
        elements.progressSteps.forEach((step, index) => {
            step.addEventListener('click', () => handleProgressStepClick(index));
        });

        // Cerrar modal al hacer clic en el botón de cerrar
        if (elements.modalCloseBtn) {
            elements.modalCloseBtn.addEventListener('click', closeModal);
        }

        // Cerrar modal al hacer clic fuera del contenido del modal
        if (elements.confirmationModal) {
            elements.confirmationModal.addEventListener('click', function(e) {
                if (e.target === elements.confirmationModal) {
                    closeModal();
                }
            });
        }
    }

    // Funciones del menú móvil
    function toggleMobileMenu() {
        elements.navList.classList.toggle('active');
        elements.mobileMenuBtn.classList.toggle('active');
    }

    // Funciones de navegación del formulario
    function handleNextStep() {
        if (validateCurrentStep()) {
            saveFormData();
            if (currentStep < elements.formSteps.length - 1) {
                currentStep++;
                updateFormSteps();
                updateProgressBar();
                // Acciones específicas para cada paso
                if (currentStep === 2) { // Si avanzamos al paso de mascota ideal
                    loadAvailablePets();
                } else if (currentStep === 3) { // Si avanzamos al paso de confirmación
                    updateSummary();
                }
                scrollToTop();
            }
        } else {
            showNotification('Por favor, completa todos los campos requeridos antes de continuar.', 'error');
        }
    }

    function handlePrevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateFormSteps();
            updateProgressBar();
            scrollToTop();
        }
    }

    // Navegación de pasos por clic en la barra de progreso
    function handleProgressStepClick(stepIndex) {
        // No permitir saltar hacia adelante sin validar el paso actual
        if (stepIndex > currentStep) {
            if (!validateCurrentStep()) {
                showNotification('Por favor, completa el paso actual antes de avanzar.', 'error');
                return;
            }
        }
        
        currentStep = stepIndex;
        updateFormSteps();
        updateProgressBar();
        saveFormData(); // Guardar datos al cambiar de paso
        if (currentStep === 2) {
            loadAvailablePets();
        } else if (currentStep === 3) {
            updateSummary();
        }
        scrollToTop();
    }


    function updateFormSteps() {
        elements.formSteps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function updateProgressBar() {
        const progress = (currentStep / (elements.formSteps.length - 1)) * 100;
        elements.progressFill.style.width = `${progress}%`;

        elements.progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Funciones de validación
    function validateField(field) {
        let isValid = true;
        const inputGroup = field.closest('.input-group');
        const errorMessage = inputGroup ? inputGroup.querySelector('.error-message') : null;
        const inputContainer = field.closest('.input-container');
        const validIcon = inputContainer ? inputContainer.querySelector('.input-valid') : null;
        const invalidIcon = inputContainer ? inputContainer.querySelector('.input-invalid') : null;

        // Resetear estados de validación
        field.classList.remove('invalid', 'valid');
        if (errorMessage) errorMessage.style.display = 'none';
        if (validIcon) validIcon.style.display = 'none';
        if (invalidIcon) invalidIcon.style.display = 'none';

        // Check if the field is part of a hidden conditional group
        const isHiddenConditional = field.closest('.conditional') && !field.closest('.conditional').classList.contains('active');
        // Check if this is the "other pet" description field and it's hidden
        // This check is slightly more robust to ensure it's truly hidden and not just 'display: none' from other CSS.
        const isOtherPetHidden = field.id === 'other-pet-description' && (elements.otherPetDetails && elements.otherPetDetails.style.display === 'none');

        if (isHiddenConditional || isOtherPetHidden) {
            // If the field is hidden by conditional logic, it's considered valid for progression
            // Clear its value and remove required attribute to ensure it doesn't block.
            field.removeAttribute('required');
            field.value = '';
            return true; // Don't block validation
        }

        // Only validate if the field is required OR if it has a value (even if not required)
        if (field.hasAttribute('required') && field.value.trim() === '') {
            isValid = false;
            // Mensajes de error contextuales
            if (field.type === 'email') errorMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
            else if (field.type === 'tel') errorMessage.textContent = 'Por favor, ingresa tu número de teléfono.';
            else if (field.name === 'full-name') errorMessage.textContent = 'Por favor, ingresa tu nombre completo.';
            else if (field.name === 'age') errorMessage.textContent = 'Por favor, ingresa tu edad.';
            else if (field.tagName === 'SELECT') errorMessage.textContent = `Por favor, selecciona una opción para ${field.previousElementSibling.textContent.toLowerCase().replace('*', '').trim()}.`;
            else if (field.tagName === 'TEXTAREA') errorMessage.textContent = `Por favor, ${field.placeholder.toLowerCase()}.`;
            else if (field.type === 'checkbox') errorMessage.textContent = 'Debes aceptar los términos para continuar.';
            else errorMessage.textContent = 'Este campo es requerido.';

        } else if (field.type === 'email' && field.value.trim() !== '' && !isValidEmail(field.value)) {
            isValid = false;
            errorMessage.textContent = 'Ingresa un correo electrónico válido.';
        } else if (field.type === 'tel' && field.value.trim() !== '' && !isValidPhone(field.value)) {
            isValid = false;
            errorMessage.textContent = 'Ingresa un número de teléfono válido (ej. +52 55 1234 5678).';
        } else if (field.type === 'number' && field.value.trim() !== '' && (isNaN(field.value) || parseInt(field.value) < parseInt(field.min || 0) || parseInt(field.value) > parseInt(field.max || 999))) {
            isValid = false;
            errorMessage.textContent = `Ingresa un número válido entre ${field.min || 0} y ${field.max || 999}.`;
        } else if (field.name === 'age' && parseInt(field.value) < 18) {
            isValid = false;
            errorMessage.textContent = 'Debes ser mayor de 18 años para adoptar.';
        }

        // Aplicar clases e iconos de validación
        if (isValid) {
            field.classList.add('valid');
            if (validIcon) validIcon.style.display = 'block';
        } else {
            field.classList.add('invalid');
            if (invalidIcon) invalidIcon.style.display = 'block';
            if (errorMessage) errorMessage.style.display = 'block';
        }

        return isValid;
    }

    function validateCurrentStep() {
        let isValidStep = true;
        const currentStepFields = elements.formSteps[currentStep].querySelectorAll('input, select, textarea');

        currentStepFields.forEach(field => {
            // Check if the field is hidden by conditional logic, regardless of its 'required' attribute.
            // If it's hidden, it does not participate in validation for progression.
            const isHiddenConditional = field.closest('.conditional') && !field.closest('.conditional').classList.contains('active');
            const isOtherPetHidden = field.id === 'other-pet-description' && (elements.otherPetDetails && elements.otherPetDetails.style.display === 'none');

            if (isHiddenConditional || isOtherPetHidden) {
                // For hidden fields, just ensure they are not marked invalid and don't block.
                field.classList.remove('invalid', 'valid'); // Clear any previous validation state
                const errorMessageElement = field.closest('.input-group')?.querySelector('.error-message');
                if (errorMessageElement) errorMessageElement.style.display = 'none';
                const inputValidIcon = field.closest('.input-container')?.querySelector('.input-valid');
                const inputInvalidIcon = field.closest('.input-container')?.querySelector('.input-invalid');
                if (inputValidIcon) validIcon.style.display = 'none';
                if (inputInvalidIcon) invalidIcon.style.display = 'none';
                return; // Skip validation for hidden fields
            }

            // For visible fields, proceed with standard validation IF they are required
            // OR if they are radio/checkbox groups that need to be checked.
            if (field.hasAttribute('required') || (field.type === 'radio' || field.type === 'checkbox')) {
                if (!validateField(field)) { // Use the validateField function for detailed checks
                    isValidStep = false;
                }
            } else if (field.value.trim() !== '') {
                // If the field is not required but has a value, validate its format (e.g., email, phone)
                // This ensures non-required but filled fields are still correctly formatted.
                if (field.type === 'email' && !isValidEmail(field.value.trim())) {
                    validateField(field); // Apply invalid styling
                    isValidStep = false;
                } else if (field.type === 'tel' && !isValidPhone(field.value.trim())) {
                    validateField(field); // Apply invalid styling
                    isValidStep = false;
                }
            }
        });

        // Special handling for radio/checkbox groups where the 'required' attribute might be on one input
        // but the validation applies to the group.
        const radioGroups = {};
        const checkboxGroups = {};

        elements.formSteps[currentStep].querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(field => {
            const isHiddenConditional = field.closest('.conditional') && !field.closest('.conditional').classList.contains('active');
            if (field.hasAttribute('required') && !isHiddenConditional) {
                if (field.type === 'radio') {
                    radioGroups[field.name] = true;
                } else if (field.type === 'checkbox') {
                    checkboxGroups[field.name] = true;
                }
            }
        });

        for (const name in radioGroups) {
            const group = document.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(group).some(input => input.checked);
            const errorMessageElement = group[0].closest('.input-group')?.querySelector('.error-message');
            const checkmark = group[0].closest('.radio-group')?.querySelector('.radio-checkmark');

            if (!isChecked) {
                isValidStep = false;
                if (errorMessageElement) {
                    errorMessageElement.textContent = 'Por favor, selecciona una opción.';
                    errorMessageElement.style.display = 'block';
                }
                if (checkmark) checkmark.classList.add('invalid');
            } else {
                if (errorMessageElement) errorMessageElement.style.display = 'none';
                if (checkmark) checkmark.classList.remove('invalid');
            }
        }

        for (const name in checkboxGroups) {
            const group = document.querySelectorAll(`input[name="${name}"]`);
            const isChecked = Array.from(group).some(input => input.checked);
            const errorMessageElement = group[0].closest('.input-group')?.querySelector('.error-message');
            const checkmark = group[0].closest('.checkbox-group')?.querySelector('.checkmark');

            if (!isChecked) {
                isValidStep = false;
                if (errorMessageElement) {
                    errorMessageElement.textContent = 'Debes aceptar los términos para continuar.';
                    errorMessageElement.style.display = 'block';
                }
                if (checkmark) checkmark.classList.add('invalid');
            } else {
                if (errorMessageElement) errorMessageElement.style.display = 'none';
                if (checkmark) checkmark.classList.remove('invalid');
            }
        }

        return isValidStep;
    }


    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        // Permite formatos como +XX XXX XXX XXXX, XXX-XXX-XXXX, XXXXXXXXXX
        return /^(\+\d{1,3})?\s?(\d{2,3}\s?){2}\d{4,5}$|^\d{3}[-\s]?\d{3}[-\s]?\d{4}$|^\d{10}$/.test(phone);
    }

    // Manejo de campos condicionales
    function handleConditionalFields() {
        elements.conditionalFields.forEach(fieldGroup => {
            const condition = fieldGroup.dataset.condition;
            const value = fieldGroup.dataset.value;
            const controllingInput = document.querySelector(`input[name="${condition}"][value="${value}"]`);
            const controllingSelect = document.querySelector(`select[name="${condition}"]`);

            let shouldActivate = false;

            if (controllingInput && controllingInput.type === 'radio') {
                if (controllingInput.checked) {
                    shouldActivate = true;
                }
            } else if (controllingSelect && controllingSelect.tagName === 'SELECT') {
                if (controllingSelect.value === value) {
                    shouldActivate = true;
                }
            }

            if (shouldActivate) {
                fieldGroup.classList.add('active');
                // Make inputs within active conditional group required
                fieldGroup.querySelectorAll('input, select, textarea').forEach(input => {
                    input.setAttribute('required', 'required');
                    // Re-validate field when it becomes active if it already has a value
                    if (input.value.trim() !== '') {
                        validateField(input);
                    }
                });
            } else {
                fieldGroup.classList.remove('active');
                // Remove required attribute and clear value for inputs within inactive conditional group
                fieldGroup.querySelectorAll('input, select, textarea').forEach(input => {
                    input.removeAttribute('required');
                    input.value = ''; // Clear value
                    input.classList.remove('invalid', 'valid'); // Remove validation classes
                    const errorMessageElement = input.closest('.input-group')?.querySelector('.error-message');
                    if (errorMessageElement) errorMessageElement.style.display = 'none';
                    const inputValidIcon = input.closest('.input-container')?.querySelector('.input-valid');
                    const inputInvalidIcon = input.closest('.input-container')?.querySelector('.input-invalid');
                    if (inputValidIcon) inputValidIcon.style.display = 'none';
                    if (inputInvalidIcon) inputInvalidIcon.style.display = 'none';
                });
            }
        });
    }


    // Funciones de selección de mascota
    function selectPet(petType) {
        elements.petOptions.forEach(option => option.classList.remove('active'));
        document.querySelector(`.pet-option[data-pet-type="${petType}"]`).classList.add('active');
        formData.selectedPet = petType; // Guardar la selección de mascota
        updatePetDetails(petType);
        // showNotification(`Has seleccionado: ${petType}`, 'info'); // Ya no es necesario con el feedback de la tarjeta
    }

    function updatePetDetails(selectedPetType) {
        elements.petDetails.forEach(detail => {
            detail.classList.remove('active-pet-details'); // Usar la nueva clase para controlar visibilidad
            // Quitar 'required' de todos los campos dentro de pet-details ocultos
            detail.querySelectorAll('select, textarea').forEach(field => {
                field.removeAttribute('required');
                validateField(field); // Limpiar validación
            });
        });

        // Ocultar el campo de texto para "otro" por defecto y quitarle required
        if (elements.otherPetDetails) {
            elements.otherPetDetails.style.display = 'none';
            elements.otherPetDetails.querySelector('textarea').removeAttribute('required');
            validateField(elements.otherPetDetails.querySelector('textarea')); // Limpiar validación
        }

        if (selectedPetType === 'dog' || selectedPetType === 'cat') {
            const targetDetail = document.getElementById(`${selectedPetType}-details`);
            if (targetDetail) {
                targetDetail.classList.add('active-pet-details');
                // Hacer requeridos los campos dentro de la sección activa
                targetDetail.querySelectorAll('select, textarea').forEach(field => {
                    field.setAttribute('required', 'required');
                });
            }
        } else if (selectedPetType === 'other') {
            if (elements.otherPetDetails) {
                elements.otherPetDetails.style.display = 'block';
                elements.otherPetDetails.querySelector('textarea').setAttribute('required', 'required'); // Hacer requerido
            }
        }
        saveFormData(); // Guardar cambios de required al cambiar tipo de mascota
    }


    // Cargar mascotas disponibles (simulado)
    function loadAvailablePets() {
        // Mostrar el spinner de carga
        let loadingDiv = elements.petsGrid.querySelector('.loading-pets');
        if (!loadingDiv) { // Si no existe, crearlo
            loadingDiv = document.createElement('div');
            loadingDiv.classList.add('loading-pets');
            loadingDiv.innerHTML = '<i class="fas fa-paw fa-spin"></i><p>Buscando mascotas disponibles...</p>';
            elements.petsGrid.appendChild(loadingDiv);
        }
        loadingDiv.style.display = 'block';
        elements.petsGrid.innerHTML = ''; // Limpiar la cuadrícula

        // Simular una llamada a la API
        setTimeout(() => {
            const pets = [{
                id: 'dog1',
                type: 'Perro',
                name: 'Buddy',
                age: '2 años',
                breed: 'Golden Retriever',
                image: 'https://images.pexels.com/photos/1012658/pexels-photo-1012658.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, {
                id: 'cat1',
                type: 'Gato',
                name: 'Whiskers',
                age: '1 año',
                breed: 'Siamés',
                image: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, {
                id: 'dog2',
                type: 'Perro',
                name: 'Lucy',
                age: '3 años',
                breed: 'Labrador',
                image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, {
                id: 'cat2',
                type: 'Gato',
                name: 'Mittens',
                age: '6 meses',
                breed: 'Persa',
                image: 'https://images.pexels.com/photos/1741206/pexels-photo-1741206.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, {
                id: 'dog3',
                type: 'Perro',
                name: 'Max',
                age: '5 años',
                breed: 'Pastor Alemán',
                image: 'https://images.pexels.com/photos/3305373/pexels-photo-3305373.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, {
                id: 'cat3',
                type: 'Gato',
                name: 'Luna',
                age: '2 años',
                breed: 'Maine Coon',
                image: 'https://images.pexels.com/photos/326875/pexels-photo-326875.jpeg?auto=compress&cs=tinysrgb&w=600'
            }, ];

            elements.petsGrid.innerHTML = ''; // Limpiar la cuadrícula de nuevo para añadir las tarjetas

            pets.forEach(pet => {
                const petCard = document.createElement('div');
                petCard.classList.add('pet-card');
                petCard.dataset.petId = pet.id;
                petCard.dataset.petName = pet.name;
                petCard.dataset.petType = pet.type;
                petCard.innerHTML = `
                    <img src="${pet.image}" alt="${pet.name}">
                    <h4>${pet.name}</h4>
                    <p>Tipo: ${pet.type}</p>
                    <p>Edad: ${pet.age}</p>
                    <p>Raza: ${pet.breed}</p>
                    <div class="select-overlay"><i class="fas fa-check-circle"></i><span>¡Seleccionado!</span></div>
                `;
                elements.petsGrid.appendChild(petCard);
            });

            // Ocultar el spinner
            if (loadingDiv) loadingDiv.style.display = 'none';


            // Añadir event listeners para seleccionar mascotas
            elements.petsGrid.querySelectorAll('.pet-card').forEach(card => {
                card.addEventListener('click', function() {
                    const petId = this.dataset.petId;
                    const petName = this.dataset.petName;
                    const petType = this.dataset.petType;
                    
                    // Deseleccionar todas las tarjetas primero
                    document.querySelectorAll('.pet-card').forEach(c => c.classList.remove('selected'));
                    
                    // Seleccionar la tarjeta actual
                    this.classList.add('selected');

                    // Guardar los detalles de la mascota seleccionada en formData
                    formData.selectedPetDetails = {
                        id: petId,
                        name: petName,
                        type: petType,
                        age: this.querySelector('p:nth-of-type(2)').textContent.replace('Edad: ', ''),
                        breed: this.querySelector('p:nth-of-type(3)').textContent.replace('Raza: ', '')
                    };
                    showNotification(`¡Has seleccionado a ${petName}!`, 'success');
                    saveFormData(); // Guardar la selección de mascota en localStorage
                });
            });

            // Si ya hay una mascota seleccionada en formData, marcarla
            if (formData.selectedPetDetails && formData.selectedPetDetails.id) {
                const selectedPetCard = elements.petsGrid.querySelector(`.pet-card[data-pet-id="${formData.selectedPetDetails.id}"]`);
                if (selectedPetCard) {
                    selectedPetCard.classList.add('selected');
                }
            }
        }, 1000); // Simular un retraso de 1 segundo para la carga
    }


    // Actualizar resumen
    function updateSummary() {
        // Limpiar resúmenes anteriores
        elements.personalSummary.innerHTML = '';
        elements.homeSummary.innerHTML = '';
        elements.petSummary.innerHTML = '';

        // Resumen de Datos Personales
        const personalData = [{
            label: 'Nombre Completo',
            value: formData['full-name']
        }, {
            label: 'Correo Electrónico',
            value: formData.email
        }, {
            label: 'Teléfono',
            value: formData.phone
        }, {
            label: 'Edad',
            value: formData.age
        }, ];
        personalData.forEach(item => {
            elements.personalSummary.innerHTML += `<div class="summary-item"><strong>${item.label}:</strong> <span>${item.value || 'No especificado'}</span></div>`;
        });

        // Resumen de Información del Hogar
        const homeData = [{
            label: 'Tipo de Vivienda',
            value: formData['housing-type']
        }, {
            label: 'Acceso a Área Exterior',
            value: formData['yard-access'] === 'yes' ? 'Sí' : 'No'
        }, {
            label: 'Personas en el Hogar',
            value: formData['family-members']
        }, {
            label: 'Otras Mascotas',
            value: formData['current-pets'] === 'yes' ? 'Sí' : 'No'
        }, ];
        homeData.forEach(item => {
            elements.homeSummary.innerHTML += `<div class="summary-item"><strong>${item.label}:</strong> <span>${item.value || 'No especificado'}</span></div>`;
        });
        if (formData['current-pets'] === 'yes' && formData['pets-details']) {
            elements.homeSummary.innerHTML += `<div class="summary-item full-width"><strong>Detalles de otras mascotas:</strong> <span>${formData['pets-details']}</span></div>`;
        }
        elements.homeSummary.innerHTML += `<div class="summary-item"><strong>Experiencia con Mascotas:</strong> <span>${formData.experience === 'yes' ? 'Sí' : 'No'}</span></div>`;


        // Resumen de Preferencias de Mascota
        elements.petSummary.innerHTML += `<div class="summary-item"><strong>Tipo de Mascota Buscada:</strong> <span>${formData.selectedPet || 'No especificado'}</span></div>`;
        if (formData.selectedPetDetails) {
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Mascota Seleccionada:</strong> <span>${formData.selectedPetDetails.name} (${formData.selectedPetDetails.breed}, ${formData.selectedPetDetails.age})</span></div>`;
        } else if (formData.selectedPet === 'other' && formData['other-pet-description']) {
             elements.petSummary.innerHTML += `<div class="summary-item full-width"><strong>Descripción de otra mascota:</strong> <span>${formData['other-pet-description']}</span></div>`;
        }

        if (formData.selectedPet === 'dog') {
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Tamaño Preferido:</strong> <span>${formData['dog-size'] || 'No especificado'}</span></div>`;
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Edad Preferida (Perro):</strong> <span>${formData['dog-age'] || 'No especificado'}</span></div>`;
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Nivel de Energía (Perro):</strong> <span>${formData['dog-energy'] || 'No especificado'}</span></div>`;
        } else if (formData.selectedPet === 'cat') {
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Edad Preferida (Gato):</strong> <span>${formData['cat-age'] || 'No especificado'}</span></div>`;
            elements.petSummary.innerHTML += `<div class="summary-item"><strong>Personalidad (Gato):</strong> <span>${formData['cat-personality'] || 'No especificado'}</span></div>`;
        }
        elements.petSummary.innerHTML += `<div class="summary-item full-width"><strong>Razón de Adopción:</strong> <span>${formData['adoption-reason'] || 'No especificado'}</span></div>`;
    }


    // Guardar y cargar datos del formulario en Local Storage
    function saveFormData() {
        elements.formSteps.forEach(stepElement => {
            stepElement.querySelectorAll('input, select, textarea').forEach(field => {
                const isHiddenConditional = field.closest('.conditional') && !field.closest('.conditional').classList.contains('active');
                const isOtherPetHidden = field.id === 'other-pet-description' && (elements.otherPetDetails && elements.otherPetDetails.style.display === 'none');

                if (!isHiddenConditional && !isOtherPetHidden) {
                    if (field.type === 'radio' || field.type === 'checkbox') {
                        if (field.checked) {
                            formData[field.name] = field.value;
                        } else if (!formData[field.name] && !field.checked && field.name in formData) {
                            // If a radio/checkbox is unchecked (e.g., by changing option), remove it
                            if (field.type === 'checkbox') {
                                delete formData[field.name];
                            }
                        }
                    } else {
                        formData[field.name] = field.value;
                    }
                } else if (isHiddenConditional || isOtherPetHidden) {
                    // If the field is hidden, remove its value from formData
                    delete formData[field.name];
                }
            });
        });
        localStorage.setItem('adoptionFormData', JSON.stringify(formData));
    }


    function loadSavedData() {
        const savedData = localStorage.getItem('adoptionFormData');
        if (savedData) {
            formData = JSON.parse(savedData);
            populateForm(formData);
        }
    }

    function populateForm(data) {
        for (const key in data) {
            const field = elements.form.elements[key];

            if (!field) continue;

            if (field.type === 'radio' || field.type === 'checkbox') {
                if (Array.isArray(field)) { // Si es un grupo de radio/checkbox
                    field.forEach(radio => {
                        if (radio.value === data[key]) {
                            radio.checked = true;
                            validateField(radio);
                        }
                    });
                } else { // Si es un solo checkbox
                    if (field.value === data[key]) {
                        field.checked = true;
                        validateField(field);
                    }
                }
            } else {
                field.value = data[key];
                validateField(field);
            }
        }

        // Restaurar selección de mascota (perro/gato/otro)
        if (data.selectedPet) {
            const petOption = document.querySelector(`.pet-option[data-pet-type=\"${data.selectedPet}\"]`);
            if (petOption) {
                elements.petOptions.forEach(option => option.classList.remove('active'));
                petOption.classList.add('active');
                updatePetDetails(data.selectedPet);
            }
        } else {
            // Si no hay mascota seleccionada en los datos guardados, seleccionar "perro" por defecto
            selectPet('dog');
        }

        // Si hay una mascota específica seleccionada en el paso 3, marcarla
        if (data.selectedPetDetails && data.selectedPetDetails.id && currentStep === 2) {
            loadAvailablePets(); // Asegurarse de que las tarjetas se carguen para poder marcar
        }
    }


    // Función para mostrar notificaciones (toast messages)
    function showNotification(message, type = 'info', duration = 3000) {
        let notification = document.getElementById('app-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'app-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = 'app-notification'; // Resetear clases
        notification.classList.add(type); // 'success', 'error', 'info'
        notification.classList.add('show');

        // Limpiar cualquier temporizador anterior para evitar que se solapen
        clearTimeout(notification.hideTimeout);
        notification.hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    // Funciones del Modal de Confirmación
    function showConfirmationModal() {
        if (elements.confirmationModal) {
            elements.confirmationModal.classList.add('active');
        }
    }

    function closeModal() {
        if (elements.confirmationModal) {
            elements.confirmationModal.classList.remove('active');
            showNotification('¡Tu solicitud ha sido enviada con éxito!', 'success', 5000); // Notificación al cerrar
            setTimeout(() => {
                clearFormAndData();
                currentStep = 0; // Resetear el paso a 0
                updateFormSteps();
                updateProgressBar();
                scrollToTop();
                selectPet('dog'); // Restablecer la selección de mascota a "perro" por defecto
            }, 500); // Pequeño retraso para que la notificación sea visible
        }
    }

    function clearFormAndData() {
        // Limpiar Local Storage
        localStorage.removeItem('adoptionFormData');
        formData = {}; // Resetear el objeto formData

        // Limpiar todos los campos del formulario
        elements.form.reset(); // Esto reseteará la mayoría de los campos de input/select

        // Limpiar clases de validación y mensajes de error
        elements.form.querySelectorAll('.invalid, .valid').forEach(field => {
            field.classList.remove('invalid', 'valid');
        });
        elements.form.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        elements.form.querySelectorAll('.input-valid, .input-invalid').forEach(icon => {
            icon.style.display = 'none';
        });


        // Resetear campos condicionales ocultos y sus valores
        elements.conditionalFields.forEach(fieldGroup => {
            fieldGroup.classList.remove('active');
            fieldGroup.querySelectorAll('input, select, textarea').forEach(input => {
                input.value = '';
                input.removeAttribute('required'); // Asegurarse de que no sean requeridos si están ocultos
                input.classList.remove('invalid', 'valid');
                const inputContainer = input.closest('.input-container');
                if (inputContainer) {
                    const validIcon = inputContainer.querySelector('.input-valid');
                    const invalidIcon = inputContainer.querySelector('.input-invalid');
                    if (validIcon) validIcon.style.display = 'none';
                    if (invalidIcon) invalidIcon.style.display = 'none';
                }
                const errorMessage = input.closest('.input-group') ? input.closest('.input-group').querySelector('.error-message') : null;
                if (errorMessage) {
                    errorMessage.textContent = '';
                    errorMessage.style.display = 'none';
                }
            });
        });

        // Ocultar el campo de "otro" tipo de mascota
        if (elements.otherPetDetails) {
            elements.otherPetDetails.style.display = 'none';
            elements.otherPetDetails.querySelector('textarea').value = '';
            elements.otherPetDetails.querySelector('textarea').removeAttribute('required');
        }


        // Deseleccionar mascotas y vaciar la cuadrícula
        elements.petOptions.forEach(option => option.classList.remove('active'));
        elements.petDetails.forEach(detail => detail.classList.remove('active-pet-details'));
        if (elements.petsGrid) {
            // Restaurar el spinner de carga para la próxima vez
            elements.petsGrid.innerHTML = '<div class="loading-pets"><i class="fas fa-paw fa-spin"></i><p>Buscando mascotas disponibles...</p></div>';
        }
    }


    // Manejar el envío del formulario
    function handleSubmitForm() {
        if (validateCurrentStep()) { // Validar el último paso antes de enviar
            saveFormData(); // Asegurarse de que los datos finales estén guardados

            // Simular envío de datos a un servidor
            console.log('Enviando solicitud de adopción:', formData);

            // Aquí iría la lógica para enviar los datos a un backend (AJAX, Fetch API, etc.)
            // fetch('/api/adopcion', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         showConfirmationModal(); // Mostrar modal de éxito
            //     } else {
            //         showNotification('Error al enviar la solicitud: ' + data.message, 'error');
            //     }
            // })
            // .catch(error => {
            //     console.error('Error en el envío:', error);
            //     showNotification('Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.', 'error');
            // });

            // Por ahora, solo simular el éxito y mostrar el modal
            setTimeout(() => {
                showConfirmationModal(); // Mostrar el modal de confirmación
            }, 500);

        } else {
            showNotification('Por favor, completa todos los campos requeridos en el último paso.', 'error');
        }
    }

    // Iniciar la aplicación
    init();
});
