document.addEventListener('DOMContentLoaded', initializeEventDetailsPage);

function initializeEventDetailsPage() {
    const eventDetails = getEventDetails();
    updatePageContent(eventDetails);
    setupMap(eventDetails.locationQuery);
    loadGalleryImage(); // Llamamos a una función simplificada para cargar la imagen
    console.log('Página de detalles del evento inicializada.');
}

function getEventDetails() {
    return {
        title: "Paws in the Park",
        date: "Sábado, 15 de junio de 2025, 10:00 - 15:00",
        locationName: "Parque Central, Ciudad",
        locationQuery: "Parque Central, Ciudad",
        calendarLink: "https://www.google.com/calendar/render?action=TEMPLATE&text=Paws+in+the+Park&dates=20250615T100000Z/20250615T150000Z&details=Disfruta+de+un+d%C3%ADa+en+el+parque+con+nuestros+animales+rescatados.&location=Parque+Central,+Ciudad",
        directionsLink: "https://www.google.com/maps/dir/?api=1&destination=$3"
    };
}

function updatePageContent(event) {
    document.getElementById('event-name-breadcrumb').textContent = event.title;
    document.getElementById('event-name').textContent = event.title;
    document.getElementById('event-date').textContent = event.date;
    document.getElementById('event-location').textContent = event.locationName;
    document.getElementById('calendar-link').href = event.calendarLink;
    document.getElementById('directions-link').href = event.directionsLink;
}

function setupMap(locationQuery) {
    const encodedLocation = encodeURIComponent(locationQuery);
    const googleMapsSearchUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Parque+Central,Ciudad`;
    const eventMapIframe = document.getElementById('event-map');
    if (eventMapIframe) {
        eventMapIframe.src = googleMapsSearchUrl;
    }
}

function loadGalleryImage() {
    const galleryGrid = document.querySelector('.gallery-grid');
    galleryGrid.innerHTML = ''; // Limpiamos cualquier contenido previo

    const imageUrl = '


'; // URL de la imagen generada

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Imagen generada de Paws in the Park';
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');
    galleryItem.appendChild(img);
    galleryGrid.appendChild(galleryItem);
}