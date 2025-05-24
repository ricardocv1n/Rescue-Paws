document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.innerHTML = mainNav.classList.contains('active') ?
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Cargar eventos
    loadEvents();

    function loadEvents() {
        const eventsContainer = document.getElementById('events-container');

        // Mostrar spinner de carga
        eventsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Cargando eventos...</p>
            </div>
        `;

        // Simular carga de API con setTimeout
        setTimeout(() => {
            // Datos de eventos con URLs de imágenes fijas de Unsplash
            const eventsData = [
                {
                    id: 'paws-park',
                    title: "Paws in the Park",
                    description: "Disfruta de un día en el parque con nuestros animales rescatados. Actividades para toda la familia y oportunidad de conocer a posibles compañeros peludos.",
                    date: "15 de junio, 10am–3pm",
                    location: "Central Park, Ciudad",
                    type: "adoption",
                    icon: "fa-paw",
                    imageUrl: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 'rescue-gala',
                    title: "Rescue Gala",
                    description: "Una noche elegante para apoyar nuestra causa. Cena, subasta silenciosa y presentación de nuestros logros del año.",
                    date: "22 de junio, 6pm",
                    location: "City Hall, Ciudad",
                    type: "fundraiser",
                    icon: "fa-hand-holding-heart",
                    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 'pet-care-workshop',
                    title: "PetSmart Weekend",
                    description: "Encuentra a tu nuevo mejor amigo en nuestro evento especial de adopción en colaboración con PetSmart.",
                    date: "28–29 de junio, 11am–4pm",
                    location: "PetSmart Local, Ciudad",
                    type: "adoption",
                    icon: "fa-store",
                    imageUrl: "https://images.unsplash.com/photo-1594149929911-78975a43d4f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 'canine-care-workshop',
                    title: "Taller de Cuidado Canino",
                    description: "Aprende los fundamentos del cuidado de perros, desde alimentación hasta primeros auxilios básicos.",
                    date: "8 de julio, 2pm–5pm",
                    location: "Centro Comunitario, Ciudad",
                    type: "workshop",
                    icon: "fa-graduation-cap",
                    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 'adoption-marathon',
                    title: "Maratón de Adopciones",
                    description: "Evento especial donde todas las tarifas de adopción tienen un 50% de descuento. ¡Ayúdanos a encontrar hogares!",
                    date: "12 de julio, 9am–7pm",
                    location: "Refugio Rescue Paws",
                    type: "adoption",
                    icon: "fa-home",
                    imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 'vaccination-campaign',
                    title: "Campaña de Vacunación",
                    description: "Ofrecemos vacunas a bajo costo para mascotas de la comunidad. Todos los fondos recaudados apoyan nuestro refugio.",
                    date: "20 de julio, 10am–4pm",
                    location: "Clínica Veterinaria Amiga",
                    type: "fundraiser",
                    icon: "fa-syringe",
                    imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                }
            ];

            displayEvents(eventsData);
            setupEventFilters();
            loadPastEvents();
        }, 1500);
    }

    function displayEvents(events) {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = '';

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>No hay eventos programados en este momento</h3>
                    <p>Por favor revisa más tarde o suscríbete a nuestro newsletter para recibir actualizaciones.</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = `event-card ${event.type}-event`;
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.imageUrl}" alt="${event.title}">
                </div>
                <div class="event-details">
                    <span class="event-date">${event.date}</span>
                    <h3 class="event-title">
                        <i class="fas ${event.icon}"></i> ${event.title}
                    </h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <span class="event-location">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </span>
                    </div>
                    <a href="detalle_evento.html?id=${event.id}" class="event-link">Más información</a>
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });
    }

    function setupEventFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventsContainer = document.getElementById('events-container');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Actualizar botones activos
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.dataset.filter;
                const eventCards = document.querySelectorAll('.event-card');

                eventCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = 'block';
                    } else {
                        card.style.display = card.classList.contains(`${filterValue}-event`) ?
                            'block' : 'none';
                    }
                });

                // Si no hay eventos para el filtro, mostrar el mensaje de "no hay eventos"
                const visibleCards = Array.from(eventCards).filter(card => card.style.display === 'block');
                if (visibleCards.length === 0) {
                    eventsContainer.innerHTML = `
                        <div class="no-events" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                            <h3>No hay eventos en la categoría "${filterValue}"</h3>
                            <p>Por favor intenta con otra categoría o revisa todos los eventos.</p>
                        </div>
                    `;
                } else if (eventsContainer.querySelector('.no-events')) {
                    // Si había un mensaje de "no hay eventos", recargar los eventos
                    loadEvents(); // Esto volverá a mostrar todos los eventos y luego se aplicará el filtro
                }
            });
        });
    }

    // Cargar eventos pasados
    function loadPastEvents() {
        const pastEventsGallery = document.getElementById('past-events-gallery');

        // Datos de eventos pasados con URLs fijas
        const pastEvents = [
            {
                id: 1,
                title: "Adopción Navideña 2022",
                imageUrl: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            },
            {
                id: 2,
                title: "Feria de Bienestar Animal",
                imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            },
            {
                id: 3,
                title: "Campaña de Esterilización",
                imageUrl: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            },
            {
                id: 4,
                title: "Día del Perro sin Hogar",
                imageUrl: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            },
            {
                id: 5,
                title: "Taller de Adiestramiento",
                imageUrl: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            },
            {
                id: 6,
                title: "Maratón de Donaciones",
                imageUrl: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
            }
        ];

        pastEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'past-event-item';
            eventItem.innerHTML = `
                <img src="${event.imageUrl}" alt="${event.title}">
                <div class="past-event-overlay">
                    <h4 class="past-event-title">${event.title}</h4>
                </div>
            `;
            pastEventsGallery.appendChild(eventItem);
        });
    }

    // Botón "Ver más" (para eventos pasados)
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simular carga de más eventos pasados
            const morePastEvents = [
                {
                    id: 7,
                    title: "Evento Benéfico Primavera",
                    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 8,
                    title: "Clínica Veterinaria Gratuita",
                    imageUrl: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                },
                {
                    id: 9,
                    title: "Adopción de Otoño",
                    imageUrl: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80"
                }
            ];
        
            
            morePastEvents.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'past-event-item';
                eventItem.innerHTML = `
                    <img src="${event.imageUrl}" alt="${event.title}">
                    <div class="past-event-overlay">
                        <h4 class="past-event-title">${event.title}</h4>
                    </div>
                `;
                document.getElementById('past-events-gallery').appendChild(eventItem);
            });
            
            // Ocultar botón después de cargar más
            this.style.display = 'none';
        });
    }
});