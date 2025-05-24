document.addEventListener('DOMContentLoaded', () => {
    const loginTabBtn = document.querySelector('.tab-button[data-tab="login"]');
    const registerTabBtn = document.querySelector('.tab-button[data-tab="register"]');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const notification = document.getElementById('notification');

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'success', duration = 3000) => {
        if (!notification) return;
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    };

    // Función para cambiar de pestaña
    const switchTab = (tabName) => {
        // Remover clase 'active' de todos los botones y paneles
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-panel').forEach(panel => panel.classList.remove('active'));

        // Añadir clase 'active' al botón y panel correctos
        if (tabName === 'login') {
            loginTabBtn.classList.add('active');
            loginPanel.classList.add('active');
        } else {
            registerTabBtn.classList.add('active');
            registerPanel.classList.add('active');
        }
    };

    // Manejadores de eventos para los botones de pestaña
    if (loginTabBtn) {
        loginTabBtn.addEventListener('click', () => switchTab('login'));
    }
    if (registerTabBtn) {
        registerTabBtn.addEventListener('click', () => switchTab('register'));
    }

    // Manejador del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showNotification('Por favor, ingresa tu correo y contraseña.', 'error');
                return;
            }

            // Simulación de autenticación
            if (email === 'test@example.com' && password === 'password123') {
                showNotification('Inicio de sesión exitoso. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'perfil.html'; // Redirigir al perfil
                }, 1500);
            } else {
                showNotification('Correo o contraseña incorrectos.', 'error');
            }
        });
    }

    // Manejador del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (!name || !email || !password || !confirmPassword) {
                showNotification('Por favor, completa todos los campos.', 'error');
                return;
            }

            if (password.length < 8) {
                showNotification('La contraseña debe tener al menos 8 caracteres.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden.', 'error');
                return;
            }

            // Simulación de registro
            showNotification('Registrando usuario...', 'info');
            setTimeout(() => {
                showNotification('Registro exitoso. ¡Bienvenido!', 'success');
                // Podrías redirigir al login o directamente al perfil
                switchTab('login'); // Volver a la pestaña de login
                loginForm.reset(); // Limpiar el formulario de login
                registerForm.reset(); // Limpiar el formulario de registro
            }, 2000);
        });
    }
});
