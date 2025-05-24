// scripts/Testimonios.js

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const filterButtons = document.querySelectorAll('.filter-button');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const storyForm = document.querySelector('.story-form');
    const backToTopButton = document.querySelector('.back-to-top-btn');
    const loadMoreButton = document.querySelector('.load-more-btn');
    const testimonialsList = document.querySelector('.testimonials-list');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.header');
    const notificationContainer = document.getElementById('app-notification'); // Nuevo: Contenedor para notificaciones

    // Nuevos elementos del formulario de testimonio
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');


    // Datos de testimonios simulados (podrías reemplazar esto con una API real)
    const testimonialsData = [
        {
            id: 1,
            category: 'dog',
            imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
            petName: 'Buddy',
            story: 'Encontramos a Buddy en un evento de adopción. Era tímido al principio, pero ahora es el rey de nuestro hogar. Cada mañana nos despierta con lamidas y su energía contagiosa llena nuestra casa de alegría.',
            author: 'Sofía y Javier',
            keywords: ['#AdopciónPerro', '#AmorParaSiempre', '#RescateCanino']
        },
        {
            id: 2,
            category: 'cat',
            imageUrl: 'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=600',
            petName: 'Misha',
            story: 'Misha llegó a nosotros siendo una gatita asustada. Con paciencia y amor, se ha convertido en una ronroneadora profesional que duerme a nuestros pies cada noche. Nunca pensamos que un pequeño felino cambiaría tanto nuestras vidas.',
            author: 'Isabela',
            keywords: ['#AdopciónGato', '#Transformación', '#AmorFelino']
        },
        {
            id: 3,
            category: 'dog',
            imageUrl: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=600',
            petName: 'Rex',
            story: 'Rex fue nuestro primer perro adoptado. Al principio tenía miedo de los ruidos fuertes, pero con entrenamiento positivo ahora es el perro más valiente que conocemos. Su lealtad no tiene igual.',
            author: 'Familia Martínez',
            keywords: ['#Superación', '#AdopciónResponsable', '#PerroValiente']
        },
        {
            id: 4,
            category: 'other',
            imageUrl: 'https://images.pexels.com/photos/4588065/pexels-photo-4588065.jpeg?auto=compress&cs=tinysrgb&w=600',
            petName: 'Coco',
            story: 'Coco es un conejo que rescatamos de una situación difícil. Aunque al principio era arisco, ahora es la mascota más cariñosa. Nos ha enseñado que el amor no tiene especies.',
            author: 'Carlos y Ana',
            keywords: ['#ConejoFeliz', '#MascotasDiferentes', '#AmorSinBarreras']
        }
    ];

    // Variables de estado
    let visibleTestimonials = 2;
    const testimonialsPerLoad = 2;
    let currentFilter = 'all';

    // Funciones principales
    function init() {
        setupEventListeners();
        renderTestimonials(); // Cambiado de renderAdditionalTestimonials
        updateBackToTopButton();
    }

    function setupEventListeners() {
        // Filtrado de testimonios
        filterButtons.forEach(button => {
            button.addEventListener('click', () => handleFilterClick(button));
        });

        // Cargar más testimonios
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', loadMoreTestimonials);
        }

        // Botón volver arriba
        if (backToTopButton) {
            backToTopButton.addEventListener('click', scrollToTop);
        }

        // Scroll para mostrar/ocultar botón
        window.addEventListener('scroll', updateBackToTopButton);

        // Menú móvil
        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Header con efecto al hacer scroll
        if (header) {
            window.addEventListener('scroll', updateHeaderOnScroll);
        }

        // Formulario de historias
        if (storyForm) {
            storyForm.addEventListener('submit', handleStorySubmission);
        }

        // Nuevo: Listener para previsualización de imagen
        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', handleImageUpload);
        }
    }

    // Funciones de filtrado
    function handleFilterClick(button) {
        const filterValue = button.dataset.filter;
        currentFilter = filterValue;
        
        // Actualizar botones activos
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn === button);
            btn.setAttribute('aria-pressed', btn === button ? 'true' : 'false');
        });

        // Filtrar testimonios destacados (si aplica, aunque estos son estáticos en HTML)
        // Si testimonialCards se refiere a los destacados, se filtran aquí.
        testimonialCards.forEach(card => {
            const shouldShow = filterValue === 'all' || card.dataset.category === filterValue;
            card.style.display = shouldShow ? 'block' : 'none';
            card.setAttribute('aria-hidden', !shouldShow);
        });


        // Filtrar y resetear la lista de "Todos los testimonios"
        visibleTestimonials = testimonialsPerLoad; // Resetear para la nueva categoría
        renderTestimonials(true); // Renderizar con el nuevo filtro
    }

    // Funciones para cargar más testimonios y renderizado
    function renderTestimonials(reset = false) {
        if (reset) {
            testimonialsList.innerHTML = ''; // Limpiar la lista si se resetea (ej. por cambio de filtro)
        }

        const filteredTestimonials = currentFilter === 'all' 
            ? testimonialsData 
            : testimonialsData.filter(t => t.category === currentFilter);

        // Asegurarse de no añadir duplicados si no se resetea
        const existingTestimonialIds = Array.from(testimonialsList.children).map(el => parseInt(el.dataset.id));

        const testimonialsToAdd = filteredTestimonials.slice(0, visibleTestimonials);

        testimonialsToAdd.forEach(testimonial => {
            if (!existingTestimonialIds.includes(testimonial.id)) {
                const testimonialElement = createTestimonialElement(testimonial);
                testimonialsList.appendChild(testimonialElement);
            }
        });

        updateLoadMoreButton(filteredTestimonials.length);
    }

    function loadMoreTestimonials() {
        visibleTestimonials += testimonialsPerLoad;
        renderTestimonials(); // Llama a renderTestimonials para añadir más
    }

    function createTestimonialElement(testimonial) {
        const article = document.createElement('article');
        article.className = 'testimonial-item';
        article.dataset.category = testimonial.category;
        article.dataset.id = testimonial.id;

        // Fallback para la imagen si no se proporciona una URL o si falla
        // Si la imagen es Base64, se renderizará directamente.
        // Si es una URL, se usará la URL.
        const imageUrl = testimonial.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image';

        article.innerHTML = `
            <div class="testimonial-image">
                <img src="${imageUrl}" 
                     alt="${testimonial.petName}, un ${getPetType(testimonial.category)} adoptado" 
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=No+Image';">
            </div>
            <div class="testimonial-content">
                <h3>${testimonial.petName}: ${testimonial.story.substring(0, 50)}...</h3>
                <p class="adopted-pet-info">Adoptado: ${testimonial.petName} (${getPetType(testimonial.category)})</p>
                <blockquote>
                    <p>"${testimonial.story}"</p>
                    <footer>- ${testimonial.author}</footer>
                </blockquote>
                <div class="keywords" aria-label="Palabras clave">
                    ${testimonial.keywords.map(keyword => `<span>${keyword}</span>`).join('')}
                </div>
            </div>
        `;

        return article;
    }

    function getPetType(category) {
        switch(category) {
            case 'dog': return 'Perro';
            case 'cat': return 'Gato';
            case 'other': return 'Otra Mascota';
            default: return 'Mascota';
        }
    }

    function updateLoadMoreButton(totalTestimonials) {
        if (!loadMoreButton) return;
        
        loadMoreButton.style.display = visibleTestimonials < totalTestimonials ? 'block' : 'none';
        
        if (visibleTestimonials >= totalTestimonials && totalTestimonials > testimonialsPerLoad) {
            loadMoreButton.textContent = 'No hay más historias';
            loadMoreButton.disabled = true;
            setTimeout(() => {
                loadMoreButton.style.display = 'none';
            }, 3000);
        } else {
            loadMoreButton.textContent = 'Cargar más historias';
            loadMoreButton.disabled = false;
        }
    }

    // Funciones de UI/UX
    function updateBackToTopButton() {
        if (!backToTopButton) return;
        
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function toggleMobileMenu() {
        mainNav.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', mainNav.classList.contains('open'));
        mobileMenuBtn.innerHTML = mainNav.classList.contains('open') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    }

    function updateHeaderOnScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Función para previsualizar la imagen cargada
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '#';
            imagePreview.classList.add('hidden');
        }
    }

    // Funciones del formulario de envío de historias
    async function handleStorySubmission(event) { // Cambiado a async
        event.preventDefault();
        
        const petNameInput = document.getElementById('pet-name');
        const authorNameInput = document.getElementById('author-name');
        const petCategorySelect = document.getElementById('pet-category');
        const imageUploadInput = document.getElementById('image-upload'); // Referencia al input de tipo file
        const storyTextarea = document.getElementById('your-story');

        const petName = petNameInput.value.trim();
        const author = authorNameInput.value.trim();
        const category = petCategorySelect.value;
        const story = storyTextarea.value.trim();
        let imageUrlBase64 = ''; // Variable para almacenar la imagen Base64

        // Validación básica del formulario
        if (!petName || !author || !category || !story) {
            showAlert('Por favor, completa todos los campos obligatorios del formulario.', 'error');
            return;
        }

        // Convertir la imagen a Base64 si se ha seleccionado un archivo
        if (imageUploadInput.files.length > 0) {
            const file = imageUploadInput.files[0];
            try {
                imageUrlBase64 = await readFileAsBase64(file);
            } catch (error) {
                showAlert('Error al cargar la imagen. Por favor, intenta con otra imagen.', 'error');
                console.error('Error reading file:', error);
                return;
            }
        }

        // Simular envío a servidor
        simulateSubmission()
            .then(() => {
                // Crear un nuevo objeto de testimonio
                const newTestimonial = {
                    id: testimonialsData.length + 1, // Asignar un ID simple (en un entorno real sería un UUID o ID de DB)
                    category: category,
                    imageUrl: imageUrlBase64, // Usar la imagen Base64
                    petName: petName,
                    story: story,
                    author: author,
                    keywords: [`#Adopción${getPetType(category).replace(/\s/g, '')}`, `#${petName}Feliz`] // Generar keywords básicas
                };

                // Añadir el nuevo testimonio a los datos
                testimonialsData.push(newTestimonial);

                // Re-renderizar la lista de testimonios para incluir el nuevo
                // Asegurarse de que el filtro actual se mantenga y se muestre el nuevo testimonio si coincide
                visibleTestimonials = testimonialsData.filter(t => currentFilter === 'all' || t.category === currentFilter).length; // Mostrar todos los que coincidan con el filtro
                renderTestimonials(true); // Forzar un reseteo y renderizado completo

                showAlert('¡Tu historia ha sido enviada con éxito! Nuestro equipo la revisará y pronto podría aparecer en esta página.', 'success');
                storyForm.reset(); // Limpiar el formulario
                imagePreview.src = '#'; // Limpiar previsualización
                imagePreview.classList.add('hidden'); // Ocultar previsualización
            })
            .catch(() => {
                showAlert('Hubo un error al enviar tu historia. Por favor, inténtalo de nuevo más tarde.', 'error');
            });
    }

    // Función auxiliar para leer un archivo como Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function simulateSubmission() {
        return new Promise((resolve) => {
            // Simular tiempo de espera de red
            setTimeout(() => {
                // En un entorno real, aquí se enviaría la data a un backend.
                // Para la simulación, siempre resolvemos como éxito.
                resolve();
            }, 1500);
        });
    }

    // Función para mostrar notificaciones temporales (similar a la de donar.js)
    function showAlert(message, type) {
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

    // Inicialización
    init();
});
