document.addEventListener('DOMContentLoaded', () => {
    console.log('El script de Perfil.js se ha cargado correctamente.');

    // --- Constantes y Variables Globales ---
    const TAB_ACTIVE_CLASS = 'active';
    const NOTIFICATION_SHOW_CLASS = 'show';
    const LOADING_CLASS = 'loading';
    const EMPTY_STATE_CLASS = 'empty';

    // Simulación de estado de autenticación
    let isLoggedIn = true; // true: usuario logueado, false: usuario no logueado

    // Datos del usuario (simulados - en una app real vendrían de una API)
    let userData = {
        name: "Ana Pérez",
        email: "ana.perez@email.com",
        phone: "+57 300 123 4567",
        address: "Calle 123 #45-67, Montería, Córdoba",
        notifications: {
            email: true,
            sms: true,
            events: true
        },
        preferences: {
            petType: "cat"
        },
        adoptedPets: [
            {
                id: 1,
                name: "Buddy",
                image: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
                adoptionDate: "15/03/2025"
            },
            {
                id: 2,
                name: "Mimi",
                image: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg",
                adoptionDate: "22/08/2024"
            }
        ],
        favorites: [
            {
                id: 3,
                name: "Max",
                image: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600",
                breed: "Golden Retriever",
                age: "2 años"
            },
            {
                id: 4,
                name: "Luna",
                image: "https://images.pexels.com/photos/1056247/pexels-photo-1056247.jpeg?auto=compress&cs=tinysrgb&w=600",
                breed: "Siamés",
                age: "1 año"
            }
        ],
        events: [
            {
                id: 101,
                title: "Jornada de Adopción",
                location: "Parque Principal, Montería",
                time: "10:00 AM - 4:00 PM",
                day: "20",
                month: "May",
                reminder: true
            },
            {
                id: 102,
                title: "Taller de Cuidado Canino",
                location: "Centro Comunitario",
                time: "2:00 PM - 5:00 PM",
                day: "28",
                month: "May",
                reminder: false
            }
        ]
    };

    // Elementos del DOM
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        mainNav: document.querySelector('.main-nav'),
        header: document.querySelector('.header'),
        navTabs: document.querySelectorAll('.nav-tab'),
        tabPanels: document.querySelectorAll('.tab-panel'),
        notification: document.getElementById('notification'),
        settingsForm: document.querySelector('.settings-form'),
        editPhotoBtn: document.querySelector('.edit-photo-btn'),
        profileImage: document.querySelector('.profile-image'),
        fileInput: document.createElement('input'),
        eventReminders: document.querySelectorAll('.event-reminder'),
        faqQuestions: document.querySelectorAll('.faq-question'),
        deleteAccountBtn: document.querySelector('.danger-btn'),
        changePasswordBtn: document.querySelector('.secondary-btn'),
        logoutBtn: document.getElementById('logout-btn'), // Nuevo botón de cerrar sesión
        profileGrid: document.querySelector('.profile-grid'),
        loggedOutLobby: document.getElementById('logged-out-lobby')
    };

    // --- Funciones de Utilidad ---
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const showNotification = (message, type = 'success', duration = 3000) => {
        if (!elements.notification) return;

        elements.notification.textContent = message;
        elements.notification.className = `notification ${type} ${NOTIFICATION_SHOW_CLASS}`;
        setTimeout(() => {
            elements.notification.classList.remove(NOTIFICATION_SHOW_CLASS);
        }, duration);
    };

    // --- Gestión de la interfaz de usuario según el estado de autenticación ---
    function updateProfileUI() {
        if (isLoggedIn) {
            elements.profileGrid.style.display = 'grid'; // Mostrar contenido del perfil
            elements.loggedOutLobby.style.display = 'none'; // Ocultar lobby
            loadUserData(); // Cargar datos del usuario
        } else {
            elements.profileGrid.style.display = 'none'; // Ocultar contenido del perfil
            elements.loggedOutLobby.style.display = 'flex'; // Mostrar lobby
            // Limpiar datos o estado si es necesario al cerrar sesión
            clearProfileData();
        }
    }

    function clearProfileData() {
        // Limpiar la UI de cualquier dato de perfil si no está logueado
        const profileNameElement = document.querySelector('.profile-meta .name');
        if (profileNameElement) profileNameElement.textContent = '';
        document.getElementById('settings-name').value = '';
        document.getElementById('settings-email').value = '';
        // Y así sucesivamente para otros campos
        document.querySelector('.adoptions-list').innerHTML = `<div class="empty-state">
            <i class="fas fa-paw"></i>
            <h3>No tienes adopciones recientes</h3>
            <p>Cuando completes un proceso de adopción, aparecerá aquí.</p>
            <a href="adopcion.html" class="btn primary-btn">Ver mascotas disponibles</a>
        </div>`;
        document.querySelector('.favorites-grid').innerHTML = `<div class="empty-state">
            <i class="fas fa-heart"></i>
            <h3>No tienes mascotas favoritas</h3>
            <p>Guarda tus mascotas favoritas haciendo clic en el corazón en las páginas de adopción.</p>
            <a href="adopcion.html" class="btn primary-btn">Explorar mascotas</a>
        </div>`;
        document.querySelector('.events-list').innerHTML = `<div class="empty-state">
            <i class="fas fa-calendar-alt"></i>
            <h3>No tienes eventos próximos</h3>
            <p>Cuando te registres en un evento, aparecerá aquí.</p>
            <a href="eventos.html" class="btn primary-btn">Ver próximos eventos</a>
        </div>`;
    }

    // --- Funciones de Autenticación (Simuladas) ---
    function handleLogout() {
        isLoggedIn = false;
        showNotification('Sesión cerrada correctamente.', 'info');
        updateProfileUI(); // Actualizar la UI inmediatamente
        // Redirigir a la página principal después de un breve retraso
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Función para simular un login (podría ser llamada desde el lobby)
    function simulateLogin() {
        isLoggedIn = true;
        showNotification('¡Bienvenido de nuevo!', 'success');
        updateProfileUI();
    }

    // --- Inicialización ---
    function init() {
        setupEventListeners();
        updateProfileUI(); // Llamar a esta función al inicio
        updateHeaderOnScroll();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Menú móvil
        if (elements.mobileMenuBtn && elements.mainNav) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Navegación por pestañas
        elements.navTabs.forEach(tab => {
            tab.addEventListener('click', switchTab);
        });

        // Scroll del header
        window.addEventListener('scroll', updateHeaderOnScroll);

        // Cambiar foto de perfil
        if (elements.editPhotoBtn) {
            setupPhotoUpload();
        }

        // Recordatorios de eventos
        elements.eventReminders.forEach(reminder => {
            reminder.addEventListener('click', toggleEventReminder);
        });

        // Preguntas frecuentes
        elements.faqQuestions.forEach(question => {
            question.addEventListener('click', toggleFaqAnswer);
        });

        // Formulario de configuración
        if (elements.settingsForm) {
            elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
        }

        // Eliminar cuenta
        if (elements.deleteAccountBtn) {
            elements.deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
        }

        // Cambiar contraseña
        if (elements.changePasswordBtn) {
            elements.changePasswordBtn.addEventListener('click', handlePasswordChange);
        }

        // Cerrar Sesión
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', handleLogout);
        }

        // Event listeners para el lobby (simulados)
        const loginRedirectBtn = document.getElementById('login-redirect-btn');
        const registerRedirectBtn = document.getElementById('register-redirect-btn');

        if (loginRedirectBtn) {
            loginRedirectBtn.addEventListener('click', () => {
                // En una app real, esto redirigiría a la página de login
                // Por ahora, simulamos un login exitoso
                simulateLogin();
            });
        }

        if (registerRedirectBtn) {
            registerRedirectBtn.addEventListener('click', () => {
                // En una app real, esto redirigiría a la página de registro
                showNotification('Redirigiendo a la página de registro...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html'; // O a una página de registro real
                }, 1000);
            });
        }
    }

    // Cargar datos del usuario (solo si está logueado)
    function loadUserData() {
        if (!isLoggedIn) return; // No cargar datos si no está logueado

        // Actualizar la UI con los datos del usuario
        updateProfileSection();
        updateAdoptionsSection();
        updateFavoritesSection(); // Nueva función para favoritos
        updateEventsSection(); // Nueva función para eventos
        updateSettingsForm();
    }

    // Actualizar sección de perfil
    function updateProfileSection() {
        const profileNameElement = document.querySelector('.profile-info h1');
        const profileEmailElement = document.querySelector('.profile-meta p:nth-child(2)');
        const profilePhoneElement = document.querySelector('.profile-meta p:nth-child(3)');
        const profileAddressElement = document.querySelector('.profile-meta p:nth-child(1)');

        if (profileNameElement) profileNameElement.textContent = userData.name;
        if (profileEmailElement) profileEmailElement.innerHTML = `<i class="fas fa-envelope"></i> ${userData.email}`;
        if (profilePhoneElement) profilePhoneElement.innerHTML = `<i class="fas fa-phone"></i> ${userData.phone}`;
        if (profileAddressElement) profileAddressElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${userData.address}`;
    }

    // Actualizar sección de adopciones
    function updateAdoptionsSection() {
        const adoptionsList = document.querySelector('#adoptions .adoptions-list');
        if (!adoptionsList) return;

        if (userData.adoptedPets.length > 0) {
            let adoptionsHTML = '<div class="pets-grid">';
            userData.adoptedPets.forEach(pet => {
                adoptionsHTML += `
                    <div class="pet-card" data-id="${pet.id}">
                        <img src="${pet.image}" alt="Foto de ${pet.name}" class="pet-image">
                        <div class="pet-info">
                            <h4>${pet.name}</h4>
                            <p>Adoptado el ${pet.adoptionDate}</p>
                            <div class="pet-actions">
                                <button class="icon-btn" aria-label="Ver historia de ${pet.name}">
                                    <i class="fas fa-book-open"></i>
                                </button>
                                <button class="icon-btn" aria-label="Compartir historia">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            adoptionsHTML += '</div>';
            adoptionsList.innerHTML = adoptionsHTML;
        } else {
            adoptionsList.innerHTML = `<div class="empty-state">
                <i class="fas fa-paw"></i>
                <h3>No tienes adopciones recientes</h3>
                <p>Cuando completes un proceso de adopción, aparecerá aquí.</p>
                <a href="adopcion.html" class="btn primary-btn">Ver mascotas disponibles</a>
            </div>`;
        }
    }

    // Actualizar sección de favoritos
    function updateFavoritesSection() {
        const favoritesGrid = document.querySelector('#favorites .favorites-grid');
        if (!favoritesGrid) return;

        if (userData.favorites.length > 0) {
            let favoritesHTML = '<div class="pets-grid">'; // Reutilizar pets-grid para consistencia
            userData.favorites.forEach(pet => {
                favoritesHTML += `
                    <div class="pet-card" data-id="${pet.id}">
                        <img src="${pet.image}" alt="Foto de ${pet.name}" class="pet-image">
                        <div class="pet-info">
                            <h4>${pet.name}</h4>
                            <p>${pet.breed} - ${pet.age}</p>
                            <div class="pet-actions">
                                <button class="icon-btn favorite-btn active" aria-label="Quitar de favoritos">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <a href="adopcion.html?id=${pet.id}" class="icon-btn" aria-label="Ver detalles">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });
            favoritesHTML += '</div>';
            favoritesGrid.innerHTML = favoritesHTML;
        } else {
            favoritesGrid.innerHTML = `<div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No tienes mascotas favoritas</h3>
                <p>Guarda tus mascotas favoritas haciendo clic en el corazón en las páginas de adopción.</p>
                <a href="adopcion.html" class="btn primary-btn">Explorar mascotas</a>
            </div>`;
        }
    }

    // Actualizar sección de eventos
    function updateEventsSection() {
        const eventsList = document.querySelector('#events .events-list');
        if (!eventsList) return;

        if (userData.events.length > 0) {
            let eventsHTML = '';
            userData.events.forEach(event => {
                eventsHTML += `
                    <div class="event-card" data-id="${event.id}">
                        <div class="event-date">
                            <span class="event-day">${event.day}</span>
                            <span class="event-month">${event.month}</span>
                        </div>
                        <div class="event-details">
                            <h4><a href="eventos.html?id=${event.id}">${event.title}</a></h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                            <p><i class="fas fa-clock"></i> ${event.time}</p>
                        </div>
                        <button class="event-reminder ${event.reminder ? 'active' : ''}">
                            <i class="fas fa-bell"></i>
                        </button>
                    </div>
                `;
            });
            eventsList.innerHTML = eventsHTML;
        } else {
            eventsList.innerHTML = `<div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h3>No tienes eventos próximos</h3>
                <p>Cuando te registres en un evento, aparecerá aquí.</p>
                <a href="eventos.html" class="btn primary-btn">Ver próximos eventos</a>
            </div>`;
        }
    }

    // Actualizar formulario de configuración
    function updateSettingsForm() {
        if (!isLoggedIn) return; // No actualizar si no está logueado
        document.getElementById('settings-name').value = userData.name;
        document.getElementById('settings-email').value = userData.email;
        document.getElementById('settings-phone').value = userData.phone;
        document.getElementById('settings-address').value = userData.address;
        document.getElementById('notif-email').checked = userData.notifications.email;
        document.getElementById('notif-sms').checked = userData.notifications.sms;
        document.getElementById('notif-events').checked = userData.notifications.events;
        document.getElementById('pref-pet-type').value = userData.preferences.petType;
    }

    // Alternar menú móvil
    function toggleMobileMenu() {
        const isExpanded = elements.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        elements.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        elements.mainNav.classList.toggle('active');
        
        // Cambiar ícono
        const icon = elements.mobileMenuBtn.querySelector('i');
        icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
    }

    // Cambiar entre pestañas
    function switchTab(event) {
        event.preventDefault();
        if (!isLoggedIn) {
            showNotification('Necesitas iniciar sesión para ver esta sección.', 'error');
            return;
        }
        
        const tab = event.currentTarget;
        const tabId = tab.getAttribute('data-tab');
        
        // Actualizar pestañas activas
        elements.navTabs.forEach(t => {
            const isSelected = t === tab;
            t.classList.toggle('active', isSelected);
            t.querySelector('a').setAttribute('aria-selected', isSelected);
        });
        
        // Mostrar el panel correspondiente
        elements.tabPanels.forEach(panel => {
            const isActive = panel.id === tabId;
            panel.classList.toggle('active', isActive);
            panel.hidden = !isActive;
            
            // Cargar datos dinámicos cuando se activa una pestaña
            if (isActive) {
                loadTabContent(tabId);
            }
        });
    }

    // Cargar contenido dinámico de pestañas
    function loadTabContent(tabId) {
        switch(tabId) {
            case 'dashboard':
                // Dashboard ya se carga con loadUserData al inicio
                break;
            case 'adoptions':
                updateAdoptionsSection();
                break;
            case 'favorites':
                updateFavoritesSection();
                break;
            case 'events':
                updateEventsSection();
                break;
            case 'settings':
                updateSettingsForm();
                break;
        }
    }

    // Configurar subida de foto de perfil
    function setupPhotoUpload() {
        elements.fileInput.type = 'file';
        elements.fileInput.accept = 'image/*';
        elements.fileInput.style.display = 'none';
        document.body.appendChild(elements.fileInput);
        
        elements.editPhotoBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                showNotification('Necesitas iniciar sesión para cambiar tu foto de perfil.', 'error');
                return;
            }
            elements.fileInput.click();
        });
        
        elements.fileInput.addEventListener('change', handlePhotoUpload);
    }

    // Manejar subida de foto
    function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar tipo y tamaño de archivo
        if (!file.type.match('image.*')) {
            showNotification('Por favor, selecciona una imagen válida.', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB
            showNotification('La imagen debe ser menor a 2MB.', 'error');
            return;
        }
        
        // Simular subida a servidor
        showNotification('Subiendo foto de perfil...', 'info');
        
        // Crear URL temporal para previsualización
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.profileImage.src = e.target.result;
            
            // Simular guardado en servidor (en una app real sería una llamada API)
            setTimeout(() => {
                showNotification('Foto de perfil actualizada con éxito!', 'success');
                // Aquí normalmente actualizarías userData.profileImage con la URL de la imagen en el servidor
            }, 1500);
        };
        reader.readAsDataURL(file);
    }

    // Alternar recordatorio de evento
    function toggleEventReminder(event) {
        if (!isLoggedIn) {
            showNotification('Necesitas iniciar sesión para gestionar recordatorios.', 'error');
            return;
        }
        const button = event.currentTarget;
        const isActive = button.classList.contains('active');
        
        // Simular actualización en servidor
        showNotification(isActive ? 'Recordatorio eliminado' : 'Recordatorio activado', 'success');
        
        button.classList.toggle('active');
        button.innerHTML = isActive ? '<i class="fas fa-bell"></i>' : '<i class="fas fa-bell-slash"></i>';
    }

    // Alternar respuesta FAQ
    function toggleFaqAnswer(event) {
        const button = event.currentTarget;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const answer = document.getElementById(button.getAttribute('aria-controls'));
        
        // Actualizar estado ARIA
        button.setAttribute('aria-expanded', !isExpanded);
        
        // Alternar visibilidad de la respuesta
        if (isExpanded) {
            answer.style.maxHeight = '0';
            answer.classList.remove('show');
        } else {
            answer.style.maxHeight = `${answer.scrollHeight}px`;
            answer.classList.add('show');
        }
        
        // Rotar ícono
        const icon = button.querySelector('.faq-icon');
        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    // Manejar envío de configuración
    function handleSettingsSubmit(event) {
        event.preventDefault();
        if (!isLoggedIn) {
            showNotification('Necesitas iniciar sesión para guardar la configuración.', 'error');
            return;
        }
        
        // Validar formulario
        if (!validateSettingsForm()) {
            return;
        }
        
        // Actualizar userData con los valores del formulario
        userData = {
            ...userData,
            name: document.getElementById('settings-name').value.trim(),
            email: document.getElementById('settings-email').value.trim(),
            phone: document.getElementById('settings-phone').value.trim(),
            address: document.getElementById('settings-address').value.trim(),
            notifications: {
                email: document.getElementById('notif-email').checked,
                sms: document.getElementById('notif-sms').checked,
                events: document.getElementById('notif-events').checked
            },
            preferences: {
                petType: document.getElementById('pref-pet-type').value
            }
        };
        
        // Simular guardado en servidor
        showNotification('Configuración guardada con éxito!', 'success');
        
        // Actualizar otras secciones si es necesario
        updateProfileSection();
    }

    // Validar formulario de configuración
    function validateSettingsForm() {
        const name = document.getElementById('settings-name').value.trim();
        const email = document.getElementById('settings-email').value.trim();
        const phone = document.getElementById('settings-phone').value.trim();
        
        if (!name || name.length < 3) {
            showNotification('Por favor ingresa un nombre válido', 'error');
            return false;
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Por favor ingresa un email válido', 'error');
            return false;
        }
        
        if (!phone || phone.length < 7) {
            showNotification('Por favor ingresa un teléfono válido', 'error');
            return false;
        }
        
        return true;
    }

    // Manejar cambio de contraseña
    function handlePasswordChange() {
        if (!isLoggedIn) {
            showNotification('Necesitas iniciar sesión para cambiar tu contraseña.', 'error');
            return;
        }
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('La nueva contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Simular cambio de contraseña en servidor
        showNotification('Cambiando contraseña...', 'info');
        
        setTimeout(() => {
            showNotification('Contraseña cambiada con éxito!', 'success');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }, 2000);
    }

    // Confirmar eliminación de cuenta
    function confirmDeleteAccount() {
        if (!isLoggedIn) {
            showNotification('Necesitas iniciar sesión para eliminar tu cuenta.', 'error');
            return;
        }
        // Reemplazar confirm() con un modal personalizado
        // const userConfirmed = confirm('¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
        // if (userConfirmed) {
            showNotification('Eliminando cuenta...', 'info');
            
            setTimeout(() => {
                showNotification('Cuenta eliminada con éxito. Redirigiendo...', 'success');
                // En una app real, redirigirías al inicio después de eliminar la cuenta
                isLoggedIn = false; // Actualizar estado
                updateProfileUI(); // Actualizar UI
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }, 2000);
        // }
    }

    // Actualizar header al hacer scroll
    function updateHeaderOnScroll() {
        if (window.scrollY > 50) {
            elements.header.classList.add('scrolled');
        } else {
            elements.header.classList.remove('scrolled');
        }
    }

    // Inicializar la aplicación
    init();
});
