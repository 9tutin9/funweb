// Header shadow on scroll
const header = document.querySelector('header');
let lastY = 0;
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  header?.classList.toggle('scrolled', y > 6);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('desktopNav');
menuBtn?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  if (isOpen) {
    mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  } else {
    mobileNav.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
});

// Smooth scroll and active link highlighting
const navLinks = Array.from(document.querySelectorAll('header .nav-links a[href^="#"]'));
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = id ? document.querySelector(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

const sections = ['#o-mne', '#sluzby', '#portfolio', '#jak-spolupracujeme', '#reference', '#estimator-title', '#kontakt']
  .map(sel => document.querySelector(sel))
  .filter(Boolean);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const id = '#' + entry.target.id;
    const link = navLinks.find(a => a.getAttribute('href') === id);
    if (link) {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
sections.forEach(sec => observer.observe(sec));

// Reveal animations on scroll
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
revealEls.forEach(el => revealObserver.observe(el));

// Testimonials simple slider
const quoteEls = Array.from(document.querySelectorAll('.quote'));
const dots = Array.from(document.querySelectorAll('.dot'));
let current = 0;
function showQuote(i) {
  quoteEls.forEach((q, idx) => q.classList.toggle('active', idx === i));
  dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  current = i;
}
dots.forEach((d, idx) => d.addEventListener('click', () => showQuote(idx)));
setInterval(() => showQuote((current + 1) % quoteEls.length), 6000);

// Contact form UX (demo)
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  success.style.display = 'inline';
  form.reset();
  setTimeout(() => (success.style.display = 'none'), 5000);
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Pills: just stay at top, no JavaScript effects

// Typewriter loop for hero verb
(function initHeroTypewriter() {
  const el = document.getElementById('hero-verb');
  if (!el) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Detect language and set appropriate words
  const isEnglish = document.documentElement.lang === 'en';
  const words = isEnglish ? ['create', 'design', 'develop'] : ['Tvořím', 'Designuji', 'Navrhuji'];
  
  let idx = 0;
  let pos = words[0].length;
  let deleting = true;
  let lastTime = 0;

  function tick(ts) {
    if (!lastTime) lastTime = ts;
    const delta = ts - lastTime;
    const speed = deleting ? 85 : 110; // ms per step, slower
    const waitAfterWord = 1100; // slightly longer pause

    if (prefersReduced) {
      // No typing animation: just swap the word every 2s
      el.textContent = words[idx];
      idx = (idx + 1) % words.length;
      setTimeout(() => requestAnimationFrame(tick), 2000);
      return;
    }

    if (deleting) {
      if (delta >= speed) {
        pos = Math.max(0, pos - 1);
        el.textContent = words[idx].slice(0, pos);
        lastTime = ts;
        if (pos === 0) {
          deleting = false;
          idx = (idx + 1) % words.length;
        }
      }
    } else {
      if (delta >= speed) {
        pos = Math.min(words[idx].length, pos + 1);
        el.textContent = words[idx].slice(0, pos);
        lastTime = ts;
        if (pos === words[idx].length) {
          // brief pause at full word
          setTimeout(() => {
            deleting = true;
            lastTime = 0;
            requestAnimationFrame(tick);
          }, waitAfterWord);
          return;
        }
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Interactive background (subtle dot grid with hover recolor)
(function initBackground() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  
  // Skip dot grid for modern theme - use aurora instead
  if (document.body.getAttribute('data-theme') === 'moderni') {
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let grid = [];
  let spacing = 40;
  let mouseX = -9999, mouseY = -9999;
  let hasMouse = false;
  let frameRequested = false;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
    render();
  }

  function buildGrid() {
    const minS = 28, maxS = 56;
    spacing = Math.round(Math.max(minS, Math.min(maxS, width / 36)));
    grid = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const xOffset = (width - (cols - 1) * spacing) / 2;
    const yOffset = (height - (rows - 1) * spacing) / 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid.push({ x: xOffset + x * spacing, y: yOffset + y * spacing });
      }
    }
  }

  function render() {
    frameRequested = false;
    ctx.clearRect(0, 0, width, height);

    // faint background grid dots
    const base = 'rgba(255,255,255,0.10)';
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#46bde5';
    const [ar, ag, ab] = hexToRgbArray(accent);
    const radiusBase = Math.max(0.8, Math.min(1.6, spacing * 0.04));
    const highlightR = Math.max(140, Math.min(260, spacing * 6));

    for (let i = 0; i < grid.length; i++) {
      const p = grid[i];
      let r = radiusBase;
      let fill = base;
      if (hasMouse) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < highlightR) {
          const t = 1 - dist / highlightR; // 0..1
          const alpha = 0.22 + 0.58 * Math.pow(t, 1.2);
          fill = `rgba(${ar}, ${ag}, ${ab}, ${alpha})`;
          r = radiusBase + 0.8 * Math.pow(t, 1.15);
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }

  function scheduleRender() {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(render);
    }
  }

  function hexToRgbArray(hex) {
    const h = hex.replace('#','');
    const full = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
    const bigint = parseInt(full, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  // events
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => { hasMouse = true; mouseX = e.clientX; mouseY = e.clientY; scheduleRender(); });
  window.addEventListener('mouseleave', () => { hasMouse = false; scheduleRender(); });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) { hasMouse = true; mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; scheduleRender(); }
  }, { passive: true });
  window.addEventListener('touchend', () => { hasMouse = false; scheduleRender(); }, { passive: true });

  // init
  resize();
  
  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const theme = document.body.getAttribute('data-theme');
        if (theme === 'moderni') {
          // Clear canvas for modern theme
          ctx.clearRect(0, 0, width, height);
        } else {
          // Rebuild grid for other themes
          buildGrid();
          render();
        }
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
})();




/* Prefill service select from URL query */
function prefillServiceFromQuery(){
  try{
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if(service){
      const sel = document.querySelector('select#service, select[name="service"]');
      if(sel){
        Array.from(sel.options).forEach(o=>{
          if(o.value.toLowerCase()===service.toLowerCase() || o.textContent.toLowerCase()===service.toLowerCase()){
            sel.value = o.value || o.textContent;
          }
        });
      }
    }
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', prefillServiceFromQuery);

// Estimator mini preview: expand/collapse items
(function initEstimatorPreview(){
  const container = document.getElementById('estimatorPreview');
  if(!container) return;
  
  let allOpen = false;
  
  function toggleAllItems(){
    const allItems = container.querySelectorAll('.estimator-preview-item');
    allItems.forEach(item => {
      item.setAttribute('aria-expanded', String(!allOpen));
      const details = item.querySelector('.estimator-preview-details');
      if(details) details.hidden = allOpen;
    });
    allOpen = !allOpen;
  }
  
  container.addEventListener('click', function(e){
    const item = e.target.closest('.estimator-preview-item');
    if(item) toggleAllItems(); // Přepni všechny karty
  });
  
  container.addEventListener('keydown', function(e){
    const item = e.target.closest('.estimator-preview-item');
    if(!item) return;
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleAllItems(); // Přepni všechny karty
    }
  });
})();

// Portfolio video hover functionality
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card');

        cards.forEach((card, index) => {
          const video = card.querySelector('video');
          
          if (!video) {
            return;
          }

          card.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('Video play failed:', e));
          });

          card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // reset na začátek
          });
  });

  // Chroma Grid effect for process steps
  const chromaGrid = document.querySelector('.chroma-grid');
  const chromaCards = document.querySelectorAll('.chroma-card');

  if (chromaGrid) {
    // Global mouse tracking for grid overlay
    chromaGrid.addEventListener('mousemove', (e) => {
      const rect = chromaGrid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      chromaGrid.style.setProperty('--x', `${x}px`);
      chromaGrid.style.setProperty('--y', `${y}px`);
      
      // Check which cards are in spotlight radius - larger for better card activation
      const radius = 250; // CSS --r value
      chromaCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2 - rect.left;
        const cardCenterY = cardRect.top + cardRect.height / 2 - rect.top;
        
        const distance = Math.sqrt(
          Math.pow(x - cardCenterX, 2) + Math.pow(y - cardCenterY, 2)
        );
        
        if (distance <= radius) {
          card.classList.add('in-spotlight');
        } else {
          card.classList.remove('in-spotlight');
        }
      });
    });

    chromaGrid.addEventListener('mouseleave', () => {
      // Reset to center when mouse leaves
      const rect = chromaGrid.getBoundingClientRect();
      chromaGrid.style.setProperty('--x', `${rect.width / 2}px`);
      chromaGrid.style.setProperty('--y', `${rect.height / 2}px`);
      
      // Remove spotlight from all cards
      chromaCards.forEach(card => {
        card.classList.remove('in-spotlight');
      });
    });
  }
});

// ProfileCard functionality
class ProfileCard {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      enableTilt: true,
      enableMobileTilt: false,
      tiltIntensity: 10,
      ...options
    };
    
    this.isHovered = false;
    this.tilt = { x: 0, y: 0 };
    this.status = 'online';
    this.showUserInfo = true;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateStatus();
    
    // Add tilt-enabled class for CSS transitions
    if (this.options.enableTilt) {
      this.element.classList.add('profile-card--tilt-enabled');
    }
  }
  
  bindEvents() {
    // Mouse move for tilt effect
    this.element.addEventListener('mousemove', (e) => {
      if (!this.options.enableTilt) return;
      
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (e.clientY - centerY) / this.options.tiltIntensity;
      const rotateY = (centerX - e.clientX) / this.options.tiltIntensity;
      
      this.tilt = { x: rotateX, y: rotateY };
      this.updateTransform();
    });
    
    // Mouse leave
    this.element.addEventListener('mouseleave', () => {
      this.tilt = { x: 0, y: 0 };
      this.isHovered = false;
      this.updateTransform();
    });
    
    // Mouse enter
    this.element.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });
  }
  
  updateTransform() {
    if (this.options.enableTilt) {
      this.element.style.transform = `perspective(1000px) rotateX(${this.tilt.x}deg) rotateY(${this.tilt.y}deg)`;
    }
  }
  
  updateStatus() {
    const statusElement = this.element.querySelector('.profile-card__status');
    const statusDot = this.element.querySelector('.profile-card__status-dot');
    const statusText = this.element.querySelector('.profile-card__status-text');
    const statusValue = this.element.querySelector('.profile-card__info-value--online');
    
    if (statusElement) {
      statusElement.setAttribute('data-status', this.status);
    }
    
    // Update status text
    if (statusText) {
      switch (this.status) {
        case 'online':
          statusText.textContent = 'Online';
          break;
        case 'away':
          statusText.textContent = 'Away';
          break;
        case 'offline':
          statusText.textContent = 'Offline';
          break;
      }
    }
    
    // Update status value
    if (statusValue) {
      switch (this.status) {
        case 'online':
          statusValue.textContent = 'Dostupný';
          break;
        case 'away':
          statusValue.textContent = 'Nedostupný';
          break;
        case 'offline':
          statusValue.textContent = 'Nedostupný';
          break;
      }
    }
    
    // Update response time
    const responseValue = this.element.querySelector('.profile-card__info-value:not(.profile-card__info-value--online)');
    if (responseValue) {
      const isEN = document.documentElement.lang === 'en' || document.body.getAttribute('data-lang') === 'en';
      switch (this.status) {
        case 'online':
          responseValue.textContent = isEN ? '< 1 hour' : '< 1 hodina';
          break;
        case 'away':
          responseValue.textContent = isEN ? '1-2 hours' : '1-2 hodiny';
          break;
        case 'offline':
          responseValue.textContent = '1-2 dny';
          break;
      }
    }
    
    // Update classes
    this.element.className = this.element.className.replace(/profile-card--status-\w+/g, '');
    this.element.classList.add(`profile-card--status-${this.status}`);
  }
  
  setStatus(status) {
    this.status = status;
    this.updateStatus();
  }
  
  getStatus() {
    return this.status;
  }
  
  isTiltEnabled() {
    return this.options.enableTilt;
  }
  
  isUserInfoVisible() {
    return this.showUserInfo;
  }
}

// Initialize ProfileCard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const aboutProfileCard = document.getElementById('aboutProfileCard');
  const heroTechScroll = document.getElementById('heroTechScroll');
  
  if (aboutProfileCard) {
    // Create ProfileCard instance for about section
    const aboutCard = new ProfileCard(aboutProfileCard, {
      enableTilt: true,
      enableMobileTilt: false,
      tiltIntensity: 8
    });
    
    console.log('About ProfileCard initialized!');
    
    // Expose to global scope for debugging
    window.aboutProfileCard = aboutCard;
  }
  
  if (heroTechScroll) {
    // Initialize hero tech scroll animation
    console.log('Hero tech scroll initialized!');
    
    // Expose to global scope for debugging
    window.heroTechScroll = heroTechScroll;
  }
});


