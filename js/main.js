(() => {
  'use strict';

  const CONFIG = {
    whatsappNumber: '584144991238',
    whatsappDefaultMessage: 'Hola IHM, quiero información sobre automatización para mi planta.',
    whatsappCatalogMessage: 'Hola IHM, quiero conocer su catálogo de equipos.',
    instagramUrl: 'https://www.instagram.com/ihmautomatizacion/',
  };

  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const message = link.dataset.whatsapp === 'catalog'
      ? CONFIG.whatsappCatalogMessage
      : CONFIG.whatsappDefaultMessage;
    link.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  });

  document.querySelectorAll('[data-instagram]').forEach((link) => {
    link.href = CONFIG.instagramUrl;
  });

  document.querySelector('#copyright-year').textContent = new Date().getFullYear();

  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuClose = document.querySelector('.menu-close');
  const desktop = window.matchMedia('(min-width: 1024px)');
  menuToggle.hidden = false;

  const closeMenu = () => menu.close();
  menuToggle.addEventListener('click', () => {
    menu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    menuClose.focus();
  });
  menuClose.addEventListener('click', closeMenu);
  menu.addEventListener('close', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (!desktop.matches) menuToggle.focus({ preventScroll: true });
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
    if (event.key !== 'Tab') return;
    const links = [...menu.querySelectorAll('a[href], button')];
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  desktop.addEventListener('change', () => {
    if (desktop.matches && menu.open) closeMenu();
  });

  const carousel = document.querySelector('#catalog-track');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const carouselButtons = [...document.querySelectorAll('[data-carousel-direction]')];
  carouselButtons.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const cardWidth = carousel.firstElementChild.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(carousel).columnGap);
      carousel.scrollBy({
        left: (cardWidth + gap) * Number(button.dataset.carouselDirection),
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    });
  });

  const updateCarousel = () => {
    const atStart = carousel.scrollLeft <= 2;
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
    carouselButtons.forEach((button) => {
      button.disabled = Number(button.dataset.carouselDirection) < 0 ? atStart : atEnd;
    });
  };
  carousel.addEventListener('scroll', updateCarousel, { passive: true });
  window.addEventListener('resize', updateCarousel, { passive: true });
  updateCarousel();

  // Progressive enhancement: content remains visible without JS or an observer.
  const revealTargets = [...document.querySelectorAll([
    '.catalog-heading', '.catalog-actions', '.catalog-track > li',
    '.services-heading', '.services-list > li', '.split-heading',
    '.image-pair > figure', '.manufacture-heading', '.manufacture-column',
    '.about-copy', '.team-images > div', '.contact-copy',
  ].join(', '))];
  let revealObserver;

  const showImmediately = (element) => {
    element.classList.remove('motion-pending', 'motion-visible');
    revealObserver?.unobserve(element);
  };

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.querySelectorAll('.services-list, .image-pair, .team-images').forEach((group) => {
      [...group.children].forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index * 80, 240)}ms`);
      });
    });

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.replace('motion-pending', 'motion-visible');
        revealObserver.unobserve(target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    revealTargets.forEach((target) => {
      const bounds = target.getBoundingClientRect();
      // Leave the initial viewport and restored scroll position fully visible.
      if (bounds.top < window.innerHeight && bounds.bottom > 0) return;
      target.classList.add('motion-pending');
      revealObserver.observe(target);
      target.addEventListener('animationend', (event) => {
        if (event.target === target) target.classList.remove('motion-visible');
      });
    });
  }

  // Keyboard navigation never lands on visually hidden content.
  document.addEventListener('focusin', (event) => {
    const pending = event.target.closest('.motion-pending, .motion-visible');
    if (pending) showImmediately(pending);
  });
  const revealAll = () => {
    revealObserver?.disconnect();
    revealTargets.forEach(showImmediately);
  };
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) revealAll();
  });
  window.addEventListener('beforeprint', revealAll);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) revealAll();
  });
})();
