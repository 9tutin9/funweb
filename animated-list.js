// Animated List JavaScript Implementation
class AnimatedList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      items: [],
      onItemSelect: null,
      showGradients: true,
      enableArrowNavigation: true,
      className: '',
      itemClassName: '',
      displayScrollbar: true,
      initialSelectedIndex: -1,
      ...options
    };
    
    this.selectedIndex = this.options.initialSelectedIndex;
    this.keyboardNav = false;
    this.topGradientOpacity = 0;
    this.bottomGradientOpacity = 1;
    this.listRef = null;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.bindEvents();
    this.updateGradients();
  }
  
  createContainer() {
    this.container.innerHTML = `
      <div class="scroll-list-container ${this.options.className}">
        <div class="scroll-list ${!this.options.displayScrollbar ? 'no-scrollbar' : ''}" data-list-ref>
          ${this.options.items.map((item, index) => `
            <div class="animated-item" data-index="${index}" data-delay="${index * 0.1}">
              <div class="item ${this.selectedIndex === index ? 'selected' : ''} ${this.options.itemClassName}">
                <p class="item-text">${item}</p>
              </div>
            </div>
          `).join('')}
        </div>
        ${this.options.showGradients ? `
          <div class="top-gradient" data-top-gradient></div>
          <div class="bottom-gradient" data-bottom-gradient></div>
        ` : ''}
      </div>
    `;
    
    this.listRef = this.container.querySelector('[data-list-ref]');
    this.animateItems();
  }
  
  animateItems() {
    const items = this.container.querySelectorAll('.animated-item');
    items.forEach((item, index) => {
      const delay = parseFloat(item.dataset.delay) * 1000;
      setTimeout(() => {
        item.classList.add('visible');
      }, delay);
    });
  }
  
  bindEvents() {
    // Click events
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.animated-item');
      if (!item) return;
      
      const index = parseInt(item.dataset.index);
      this.selectItem(index);
    });
    
    // Hover events
    this.container.addEventListener('mouseenter', (e) => {
      const item = e.target.closest('.animated-item');
      if (!item) return;
      
      const index = parseInt(item.dataset.index);
      this.hoverItem(index);
    }, true);
    
    // Scroll events
    if (this.listRef) {
      this.listRef.addEventListener('scroll', (e) => {
        this.handleScroll(e);
      });
    }
    
    // Keyboard navigation
    if (this.options.enableArrowNavigation) {
      document.addEventListener('keydown', (e) => {
        this.handleKeyDown(e);
      });
    }
  }
  
  handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    this.topGradientOpacity = Math.min(scrollTop / 50, 1);
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    this.bottomGradientOpacity = scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
    this.updateGradients();
  }
  
  handleKeyDown(e) {
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      this.keyboardNav = true;
      this.selectItem(Math.min(this.selectedIndex + 1, this.options.items.length - 1));
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      this.keyboardNav = true;
      this.selectItem(Math.max(this.selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      if (this.selectedIndex >= 0 && this.selectedIndex < this.options.items.length) {
        e.preventDefault();
        this.triggerItemSelect();
      }
    }
  }
  
  selectItem(index) {
    if (index < 0 || index >= this.options.items.length) return;
    
    // Remove previous selection
    const prevSelected = this.container.querySelector('.item.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }
    
    // Add new selection
    const newSelected = this.container.querySelector(`[data-index="${index}"] .item`);
    if (newSelected) {
      newSelected.classList.add('selected');
    }
    
    this.selectedIndex = index;
    this.scrollToSelected();
    this.triggerItemSelect();
  }
  
  hoverItem(index) {
    // Optional: Add hover effects here
  }
  
  scrollToSelected() {
    if (!this.keyboardNav || this.selectedIndex < 0 || !this.listRef) return;
    
    const selectedItem = this.container.querySelector(`[data-index="${this.selectedIndex}"]`);
    if (!selectedItem) return;
    
    const container = this.listRef;
    const extraMargin = 50;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;
    
    if (itemTop < containerScrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
    } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
      container.scrollTo({
        top: itemBottom - containerHeight + extraMargin,
        behavior: 'smooth'
      });
    }
    
    this.keyboardNav = false;
  }
  
  triggerItemSelect() {
    if (this.options.onItemSelect && this.selectedIndex >= 0) {
      this.options.onItemSelect(this.options.items[this.selectedIndex], this.selectedIndex);
    }
  }
  
  updateGradients() {
    const topGradient = this.container.querySelector('[data-top-gradient]');
    const bottomGradient = this.container.querySelector('[data-bottom-gradient]');
    
    if (topGradient) {
      topGradient.style.opacity = this.topGradientOpacity;
    }
    if (bottomGradient) {
      bottomGradient.style.opacity = this.bottomGradientOpacity;
    }
  }
  
  updateItems(newItems) {
    this.options.items = newItems;
    this.selectedIndex = -1;
    this.createContainer();
  }
  
  destroy() {
    if (this.options.enableArrowNavigation) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }
}

// Portfolio Integration
class PortfolioAnimated {
  constructor() {
    this.translationMap = new Map();
    this.loadTranslations();
    // Map EUR-based CZ strings to CZK equivalents for Czech locale rendering
    this.priceCzMap = {
      'Platby od 240 EUR': 'Platby od 5 900 Kč',
      'Admin panel od 360 EUR': 'Admin panel od 8 900 Kč',
      'Formulář od 160 EUR': 'Formulář od 3 900 Kč'
    };
    this.portfolioItems = [
      {
        name: 'DetiDetem.eu',
        baseUrl: 'https://detidetem.eu',
        video: 'video_opt.mp4',
        description: 'E-shop pro dětské oblečení',
        previewTitle: 'Domovská stránka',
        expanded: false,
        subPages: [
          {
            name: 'Domovská stránka',
            video: 'video_opt.mp4',
            thumbnail: 'video-thumb.webp',
            previewTitle: 'Domovská stránka',
            url: 'https://detidetem.eu',
            isMain: true,
            info: {
              price: 'Balíček od 45 000 Kč',
              title: 'Charitativní e-shop – Děti dětem',
              description: 'Kompletní modernizovaný e-shop pro charitativní projekt pomoci dětem v Jemenu. Obsahuje glassmorphism design, responzivní layout, platební systém, správu objednávek, transparentní reporting a pokročilé UX/UI prvky.',
              tags: ['HTML5/CSS3', 'Vanilla JS', 'Glassmorphism', 'E-shop', 'Charita', 'Responzivní', 'PWA Ready']
            }
          },
          {
            name: 'Platby',
            video: 'video-payments_opt.mp4',
            thumbnail: 'video-payments-thumb.webp',
            previewTitle: 'Platby',
            url: 'https://detidetem.eu',
            info: {
              price: 'Platby od 240 EUR',
              title: 'Systém plateb a fakturace',
              description: 'Bezpečný platební systém s integrací do stávajícího webu. Podpora všech platebních metod, automatická fakturace a sledování plateb.',
              tags: ['Platební brána', 'Fakturace', 'Bezpečnost', 'API', 'Automatizace']
            }
          },
          {
            name: 'Administrace',
            video: 'video-admin_opt.mp4',
            thumbnail: 'video-admin-thumb.webp',
            previewTitle: 'Administrace',
            url: 'https://detidetem.eu',
            info: {
              price: 'Admin panel od 360 EUR',
              title: 'Pokročilý administrační panel',
              description: 'Kompletní řešení pro správu obsahu, produktů a zákazníků. Intuitivní rozhraní s pokročilými funkcemi pro efektivní správu webu.',
              tags: ['CMS', 'Databáze', 'Uživatelé', 'Obsah', 'Statistiky']
            }
          }
        ]
      },
      {
        name: 'stavebninylhotsky.cz',
        baseUrl: 'https://stavebninylhotsky.cz',
        video: 'video2_opt.mp4',
        description: 'Web pro stavební firmu',
        previewTitle: 'Domovská stránka',
        expanded: false,
        subPages: [
          {
            name: 'Domovská stránka',
            video: 'video2_opt.mp4',
            thumbnail: 'video2-thumb.webp',
            previewTitle: 'Domovská stránka',
            url: 'https://stavebninylhotsky.cz',
            isMain: true,
            info: {
              price: 'Balíček od 23 000 Kč',
              title: 'Renovace webu stavebninylhotsky.cz',
              description: 'Kompletní modernizace zastaralého webu s netradičními řešeními. Obsahuje pokročilý admin panel pro správu produktů, inovativní systém poptávek s automatizací, dynamický ceník s databází, dark/light mode, Supabase backend a efektivní workflow pro stavební firmy.',
              tags: ['Admin Panel', 'Supabase', 'Poptávky', 'Databáze', 'Dark Mode', 'Workflow', 'Automatizace']
            }
          },
          {
            name: 'Platby',
            video: 'video2-payments_opt.mp4',
            thumbnail: 'video2-payments-thumb.webp',
            previewTitle: 'Platby',
            url: 'https://stavebninylhotsky.cz',
            info: {
              price: 'Platby od 240 EUR',
              title: 'Systém plateb a fakturace',
              description: 'Bezpečný platební systém s integrací do stávajícího webu. Podpora všech platebních metod, automatická fakturace a sledování plateb.',
              tags: ['Platební brána', 'Fakturace', 'Bezpečnost', 'API', 'Automatizace']
            }
          },
          {
            name: 'Administrace',
            video: 'video2-admin_opt.mp4',
            thumbnail: 'video2-admin-thumb.webp',
            previewTitle: 'Administrace',
            url: 'https://stavebninylhotsky.cz',
            info: {
              price: 'Admin panel od 360 EUR',
              title: 'Pokročilý administrační panel',
              description: 'Kompletní řešení pro správu obsahu, produktů a zákazníků. Intuitivní rozhraní s pokročilými funkcemi pro efektivní správu webu.',
              tags: ['CMS', 'Databáze', 'Uživatelé', 'Obsah', 'Statistiky']
            }
          }
        ]
      },
      {
        name: 'systemwrap.cz',
        baseUrl: 'https://systemwrap.cz',
        video: 'video3_opt.mp4',
        description: 'Technologické řešení',
        previewTitle: 'Domovská stránka',
        expanded: false,
        subPages: [
          {
            name: 'Domovská stránka',
            video: 'video3_opt.mp4',
            thumbnail: 'video3-thumb.webp',
            previewTitle: 'Domovská stránka',
            url: 'https://systemwrap.cz',
            isMain: true,
            info: {
              price: 'Balíček od 23 000 Kč',
              title: 'Web pro polepy aut - SYSTEMWRAP',
              description: 'Moderní one-page web pro automobilové služby, který nakopnul business. Obsahuje interaktivní portfolio prací, animované sekce, kontaktní formulář a responzivní design s pokročilými CSS efekty a JavaScript animacemi.',
              tags: ['One-Page', 'Animace', 'Portfolio', 'Formulář', 'Canvas', 'Parallax']
            }
          },
          {
            name: 'Formulář',
            video: 'video3-payments_opt.mp4',
            thumbnail: 'video3-payments-thumb.webp',
            previewTitle: 'Formulář',
            url: 'https://systemwrap.cz',
            info: {
              price: 'Formulář od 160 EUR',
              title: 'Interaktivní kontaktní formulář',
              description: 'Chytrý formulář s pokročilými funkcemi. Kliknutím na ikonu telefonu se otevře aplikace volání, kliknutím na email se spustí poštovní klient. Responzivní design s validací a animacemi.',
              tags: ['Formulář', 'Telefon', 'Email', 'Validace', 'Animace', 'Responzivní', 'UX/UI']
            }
          }
        ]
      },
      {
        name: 'medomed.cz',
        baseUrl: 'https://medomed.cz',
        video: 'video4_opt.mp4',
        description: 'Zdravotnický portál',
        previewTitle: 'Domovská stránka',
        expanded: false,
        subPages: [
          {
            name: 'Domovská stránka',
            video: 'video4_opt.mp4',
            thumbnail: 'video4-thumb.webp',
            previewTitle: 'Domovská stránka',
            url: 'https://medomed.cz',
            isMain: true,
            info: {
              price: 'Balíček od 16 000 Kč',
              title: 'Zdravotnický portál MedoMed.cz',
              description: 'Moderní zdravotnický portál s pokročilými funkcemi pro zdravotníky a pacienty. Obsahuje responzivní design, intuitivní navigaci a specializované funkce pro zdravotnický sektor.',
              tags: ['Zdravotnictví', 'Portál', 'Responzivní', 'UX/UI', 'Specializované funkce']
            }
          }
        ]
      }
    ];
    
    this.currentPreview = null;
    this.init();
  }
  
  init() {
    this.createPortfolioSection();
    this.initAnimatedList();
    this.bindVideoEvents();
  }
  
  createPortfolioSection() {
    const portfolioSection = document.querySelector('.portfolio');
    if (!portfolioSection) return;
    
    const currentLang = document.documentElement.lang || 'cs';
    
    portfolioSection.innerHTML = `
      <div class="container">
        <div class="section-header">
          <div class="section-title">
            <span class="section-label">${this.getTranslation('Portfolio', currentLang)}</span>
            <h2>${this.getTranslation('Ukázky mé práce', currentLang)}</h2>
          </div>
          <p class="lead">${this.getTranslation('Projekty, které jsem vytvořil pro klienty. Každý web je jedinečný a přizpůsobený potřebám daného byznysu.', currentLang)}</p>
        </div>
      </div>
      
      <div class="portfolio-animated">
        <div>
          <div class="animated-list-container" id="portfolioList"></div>
        </div>
        <div>
          <div id="portfolioPreview">
            <p>${this.getTranslation('Vyberte projekt z seznamu pro zobrazení náhledu', currentLang)}</p>
          </div>
        </div>
        <div class="portfolio-info">
          <div class="portfolio-info-card" id="portfolioInfo">
            <p>${this.getTranslation('Vyberte projekt z seznamu pro zobrazení informací', currentLang)}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  initAnimatedList() {
    const listContainer = document.getElementById('portfolioList');
    if (!listContainer) return;
    
    this.createExpandableList(listContainer);
    
    // Zobrazit první preview
    this.showPreview(0, 0); // webIndex, subPageIndex
  }
  
  createExpandableList(listContainer) {
    const currentLang = document.documentElement.lang || 'cs';
    
    listContainer.innerHTML = `
      <div class="scroll-list-container">
        <div class="scroll-list">
          ${this.portfolioItems.map((web, webIndex) => `
            <div class="web-item" data-web-index="${webIndex}">
              <div class="web-header" data-web-header="${webIndex}">
                <div class="web-name">${web.name}</div>
                <div class="expand-icon">▼</div>
              </div>
                   <div class="sub-pages" data-sub-pages="${webIndex}">
                ${web.subPages.map((subPage, subIndex) => `
                  <div class="sub-page-item" data-web-index="${webIndex}" data-sub-index="${subIndex}">
                    <div class="sub-page-name">${this.getTranslation(subPage.name, currentLang)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="top-gradient"></div>
        <div class="bottom-gradient"></div>
      </div>
    `;
    
    this.bindExpandableEvents(listContainer);
  }
  
  bindExpandableEvents(listContainer) {
    // Web header clicks (expand/collapse)
    listContainer.addEventListener('click', (e) => {
      const webHeader = e.target.closest('[data-web-header]');
      if (webHeader) {
        const webIndex = parseInt(webHeader.dataset.webHeader);
        this.toggleWeb(webIndex);
        return;
      }
      
      // Sub-page clicks
      const subPageItem = e.target.closest('[data-sub-index]');
      if (subPageItem) {
        const webIndex = parseInt(subPageItem.dataset.webIndex);
        const subIndex = parseInt(subPageItem.dataset.subIndex);
        this.selectSubPage(webIndex, subIndex);
      }
    });
  }
  
  toggleWeb(webIndex) {
    const web = this.portfolioItems[webIndex];
    const subPages = document.querySelector(`[data-sub-pages="${webIndex}"]`);
    const expandIcon = document.querySelector(`[data-web-header="${webIndex}"] .expand-icon`);
    
    if (!subPages || !expandIcon) return;
    
    web.expanded = !web.expanded;
    
    if (web.expanded) {
      subPages.classList.add('expanded');
      expandIcon.textContent = '▲';
      expandIcon.style.transform = 'rotate(180deg)';
    } else {
      subPages.classList.remove('expanded');
      expandIcon.textContent = '▼';
      expandIcon.style.transform = 'rotate(0deg)';
    }
  }
  
  selectSubPage(webIndex, subIndex) {
    // Remove previous selections
    document.querySelectorAll('.sub-page-item.selected').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add new selection
    const selectedItem = document.querySelector(`[data-web-index="${webIndex}"][data-sub-index="${subIndex}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    this.showPreview(webIndex, subIndex);
  }
  
  showPreview(webIndex, subIndex = 0) {
    if (webIndex < 0 || webIndex >= this.portfolioItems.length) return;
    
    const web = this.portfolioItems[webIndex];
    const subPage = web.subPages[subIndex];
    if (!subPage) return;
    const previewContainer = document.getElementById('portfolioPreview');
    if (!previewContainer) return;
    
    const currentLang = document.documentElement.lang || 'cs';
    const targetUrl = (subPage && (subPage.url || (web && web.baseUrl))) || '#';
    previewContainer.innerHTML = `
       <div class="portfolio-preview-card">
        <video muted loop preload="none" poster="${subPage.thumbnail || 'video-thumb.jpg'}" loading="lazy" playsinline webkit-playsinline>
           <source src="${subPage.video}" type="video/mp4">
           ${this.getTranslation('Váš prohlížeč nepodporuje video.', currentLang)}
         </video>
         <div class="portfolio-preview-overlay">
           <h3><a href="${targetUrl}" target="_blank" rel="noopener noreferrer">${this.getTranslation(subPage.previewTitle, currentLang)}</a></h3>
         </div>
       </div>
     `;
    
    this.currentPreview = previewContainer.querySelector('video');
    this.setupVideoEvents();
    
    // Update info card
    this.updateInfoCard(webIndex, subIndex);
  }
  
  updateInfoCard(webIndex, subIndex) {
    const web = this.portfolioItems[webIndex];
    const subPage = web.subPages[subIndex];
    const infoContainer = document.getElementById('portfolioInfo');
    
    if (!subPage || !subPage.info || !infoContainer) return;
    
    const currentLang = document.documentElement.lang || 'cs';
    const info = subPage.info;
    // Choose currency per language: CZ -> Kč, EN -> EUR
    const priceKey = currentLang === 'cs' && this.priceCzMap[info.price]
      ? this.priceCzMap[info.price]
      : info.price;
    infoContainer.innerHTML = `
      <div class="info-price">${this.getTranslation(priceKey, currentLang)}</div>
      <div class="info-title">${this.getTranslation(info.title, currentLang)}</div>
      <div class="info-description">${this.getTranslation(info.description, currentLang)}</div>
      <div class="info-tags">
        ${info.tags.map(tag => `<span class="info-tag">${this.getTranslation(tag, currentLang)}</span>`).join('')}
      </div>
      <button class="info-cta" onclick="document.querySelector('#kontakt').scrollIntoView({behavior: 'smooth'})">
        ${this.getTranslation('Domluvit konzultaci zdarma', currentLang)}
      </button>
    `;
  }
  
  bindVideoEvents() {
    // Video events will be set up when preview is shown
  }
  
  setupVideoEvents() {
    if (!this.currentPreview) return;
    
    const card = this.currentPreview.closest('.portfolio-preview-card');
    if (!card) return;
    
    // Load video only when needed
    let videoLoaded = false;
    
    card.addEventListener('mouseenter', () => {
      if (!videoLoaded) {
        this.currentPreview.load();
        videoLoaded = true;
      }
      this.currentPreview.play().catch(e => console.log('Video play failed:', e));
    });
    
    card.addEventListener('mouseleave', () => {
      this.currentPreview.pause();
      this.currentPreview.currentTime = 0;
    });

    // Mobile: single tap = play inline; double tap = fullscreen
    let lastTapMs = 0;
    const onTouch = (ev) => {
      const now = Date.now();
      // Prevent default zoom behaviors
      ev.preventDefault();
      // Single tap behavior: play inline
      if (now - lastTapMs > 300) {
        lastTapMs = now;
        if (!videoLoaded) {
          this.currentPreview.load();
          videoLoaded = true;
        }
        this.currentPreview.play().catch(() => {});
        return;
      }
      // Double tap within threshold → try fullscreen
      lastTapMs = 0;
      const v = this.currentPreview;
      if (v.requestFullscreen) {
        v.requestFullscreen().catch(() => {});
      } else if (v.webkitEnterFullscreen) {
        try { v.webkitEnterFullscreen(); } catch (_) {}
      } else if (v.webkitRequestFullscreen) {
        try { v.webkitRequestFullscreen(); } catch (_) {}
      }
    };
    // Attach on both touchend and pointerup to cover platforms
    card.addEventListener('touchend', onTouch, { passive: false });
    card.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') onTouch(e);
    }, { passive: false });
  }
  
  async loadTranslations() {
    try {
      const response = await fetch('translations_cz_en.json');
      const translationData = await response.json();
      
      // Convert array format to Map for easy lookup
      translationData.forEach(item => {
        if (item.CZ && item.EN) {
          this.translationMap.set(item.CZ, item.EN);
        }
      });
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }
  
  getTranslation(czText, lang = 'cs') {
    if (lang === 'cs') return czText;
    return this.translationMap.get(czText) || czText;
  }
  
  updateLanguage(lang) {
    // Recreate portfolio section with new language
    this.createPortfolioSection();
    this.initAnimatedList();
    
    // Update current preview if exists
    const currentWebIndex = this.getCurrentWebIndex();
    const currentSubIndex = this.getCurrentSubIndex();
    if (currentWebIndex !== -1 && currentSubIndex !== -1) {
      this.showPreview(currentWebIndex, currentSubIndex);
    }
  }
  
  getCurrentWebIndex() {
    const selectedItem = document.querySelector('.sub-page-item.selected');
    if (selectedItem) {
      return parseInt(selectedItem.dataset.webIndex);
    }
    return 0;
  }
  
  getCurrentSubIndex() {
    const selectedItem = document.querySelector('.sub-page-item.selected');
    if (selectedItem) {
      return parseInt(selectedItem.dataset.subIndex);
    }
    return 0;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', async function() {
  const portfolioAnimated = new PortfolioAnimated();
  await portfolioAnimated.loadTranslations();
  console.log('Portfolio Animated List initialized!');
  window.portfolioAnimated = portfolioAnimated;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimatedList, PortfolioAnimated };
}
