document.addEventListener('DOMContentLoaded', function() {
  // Actualizar año en el footer
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Menú móvil
  const burger = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');
  
  burger.addEventListener('click', function() {
    nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
  
  // Cerrar menú al hacer clic en un enlace
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Efecto de scroll en header
  window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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
  
  // Animación de contadores
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;
      const increment = target / speed;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(animateCounters, 1);
      } else {
        counter.innerText = target + '+';
      }
    });
  };
  
  // Lazy loading para imágenes
  const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.getAttribute('src');
            imageObserver.unobserve(image);
          }
        });
      });
      
      images.forEach(image => imageObserver.observe(image));
    }
  };
  
  // Animación al hacer scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.pet-card, .testimonial-card, .process-step');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  };
  
  // Filtrado de mascotas
  const filterButtons = document.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase active de todos los botones
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      
      // Añadir clase active al botón clickeado
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      
      const filterValue = this.getAttribute('data-filter');
      const petCards = document.querySelectorAll('.pet-card');
      
      petCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Iniciar funciones
  animateCounters();
  lazyLoadImages();
  animateOnScroll();
});