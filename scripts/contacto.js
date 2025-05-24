// scripts/contacto.js

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        mainNav: document.querySelector('.main-nav'),
        contactForm: document.getElementById('contactForm'),
        nameInput: document.getElementById('name'),
        emailInput: document.getElementById('email'),
        messageInput: document.getElementById('message'),
        notification: document.getElementById('app-notification'), // Elemento de notificación
        faqQuestions: document.querySelectorAll('.faq-question'), // Preguntas frecuentes
        backToTopBtn: document.querySelector('.back-to-top-btn') // Botón volver arriba
    };

    /**
     * Función para mostrar notificaciones (reemplaza alert/confirm)
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - Tipo de notificación ('info', 'success', 'error').
     */
    function showNotification(message, type = 'info') {
        if (!elements.notification) {
            console.error('Elemento de notificación no encontrado. Asegúrate de tener <div id="app-notification"></div> en tu HTML.');
            return;
        }
        elements.notification.textContent = message;
        elements.notification.className = 'notification show ' + type; // Añadir clase de tipo
        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 3000); // Ocultar después de 3 segundos
    }

    /**
     * Función para validar un campo individual del formulario.
     * @param {HTMLElement} field - El elemento input/textarea/select a validar.
     * @returns {boolean} True si el campo es válido, false en caso contrario.
     */
    function validateField(field) {
        let isValid = true;
        let errorMessage = '';
        const errorSpan = document.getElementById(field.id + '-error');

        if (field.hasAttribute('required') && field.value.trim() === '') {
            isValid = false;
            errorMessage = 'Este campo es obligatorio.';
        } else if (field.type === 'email' && !/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(field.value)) {
            isValid = false;
            errorMessage = 'Por favor, introduce un correo electrónico válido.';
        }

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            if (errorSpan) errorSpan.style.display = 'none';
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            if (errorSpan) {
                errorSpan.textContent = errorMessage;
                errorSpan.style.display = 'block';
            }
        }
        return isValid;
    }

    /**
     * Configura todos los event listeners para los elementos interactivos de la página.
     */
    function setupEventListeners() {
        // Menú móvil (si existe)
        if (elements.mobileMenuBtn && elements.mainNav) {
            elements.mobileMenuBtn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                elements.mainNav.classList.toggle('active');
                document.body.style.overflow = elements.mainNav.classList.contains('active') ? 'hidden' : '';
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (elements.mainNav.classList.contains('active')) {
                        elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        elements.mainNav.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });
        }

        // Validación en tiempo real para campos del formulario
        if (elements.nameInput) elements.nameInput.addEventListener('input', () => validateField(elements.nameInput));
        if (elements.emailInput) elements.emailInput.addEventListener('input', () => validateField(elements.emailInput));
        if (elements.messageInput) elements.messageInput.addEventListener('input', () => validateField(elements.messageInput));

        // Manejo del envío del formulario
        if (elements.contactForm) {
            elements.contactForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevenir envío por defecto

                let formIsValid = true;
                // Validar todos los campos requeridos al enviar
                if (!validateField(elements.nameInput)) formIsValid = false;
                if (!validateField(elements.emailInput)) formIsValid = false;
                if (!validateField(elements.messageInput)) formIsValid = false;

                if (formIsValid) {
                    // Simular envío exitoso (en un entorno real, aquí harías un fetch/AJAX a un backend)
                    console.log('Formulario enviado:', {
                        name: elements.nameInput.value,
                        email: elements.emailInput.value,
                        subject: elements.contactForm.subject.value,
                        message: elements.messageInput.value
                    });

                    showNotification('¡Mensaje enviado correctamente!', 'success');
                    elements.contactForm.reset(); // Limpiar formulario
                    // Remover clases de validación después de limpiar
                    elements.nameInput.classList.remove('valid', 'invalid');
                    elements.emailInput.classList.remove('valid', 'invalid');
                    elements.messageInput.classList.remove('valid', 'invalid');
                } else {
                    showNotification('Por favor, corrige los errores del formulario.', 'error');
                }
            });
        }

        // Acordeón de preguntas frecuentes
        elements.faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                
                const answer = this.nextElementSibling;
                answer.classList.toggle('show');
            });
        });

        // Botón volver arriba
        if (elements.backToTopBtn) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 300) {
                    elements.backToTopBtn.classList.add('visible');
                } else {
                    elements.backToTopBtn.classList.remove('visible');
                }
            });
            
            elements.backToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Controla las animaciones de las secciones al hacer scroll.
     */
    const animateOnScroll = () => {
        const sections = document.querySelectorAll('.contact-hero, .contact-grid, .map-section, .faq-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in'); // Añadir clase para animación
                    observer.unobserve(entry.target); // Dejar de observar una vez que se anima
                }
            });
        }, {
            threshold: 0.1, // Elemento visible en un 10%
            rootMargin: '0px 0px -50px 0px' // Margen para activar antes de que el elemento esté completamente visible
        });

        sections.forEach(section => {
            section.classList.add('animate-on-scroll'); // Clase base para la animación (opcional, si tienes estilos base)
            observer.observe(section);
        });
    };

    // Inicializar la página cuando el DOM esté completamente cargado
    setupEventListeners();
    animateOnScroll();
});
