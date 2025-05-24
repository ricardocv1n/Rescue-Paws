document.addEventListener('DOMContentLoaded', function() {
  // Menú móvil
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  
  mobileMenuBtn.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    mainNav.classList.toggle('active');
    document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
  });

  // Cerrar menú al hacer clic en enlace
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('active')) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Galería de imágenes
  const thumbnails = document.querySelectorAll('.thumbnail-btn');
  const mainImage = document.getElementById('main-image');
  
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      // Remover clase active de todas las miniaturas
      thumbnails.forEach(t => t.classList.remove('active'));
      
      // Añadir clase active a la miniatura clickeada
      this.classList.add('active');
      
      // Cambiar imagen principal con efecto de transición
      const newImage = this.querySelector('img').src;
      const newAlt = this.querySelector('img').alt;
      
      mainImage.style.opacity = '0';
      
      setTimeout(() => {
        mainImage.src = newImage;
        mainImage.alt = newAlt;
        mainImage.style.opacity = '1';
      }, 200);
    });
  });

  // Acordeón de preguntas frecuentes
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      
      const answer = this.nextElementSibling;
      answer.classList.toggle('show');
    });
  });

  // Botón volver arriba
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Animaciones al hacer scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animal-section, .sidebar-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  };
  
  // Actualizar año en el footer
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Iniciar animaciones
  animateOnScroll();
});