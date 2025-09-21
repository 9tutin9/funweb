// PillNav JavaScript Implementation
class PillNav {
  constructor(options = {}) {
    this.config = {
      logo: null,
      logoAlt: 'Logo',
      items: [],
      activeHref: '/',
      className: '',
      baseColor: '#000000',
      pillColor: '#ffffff',
      hoveredPillTextColor: '#ffffff',
      pillTextColor: '#000000',
      onMobileMenuClick: null,
      initialLoadAnimation: true,
      ...options
    };
    
    this.isMobileMenuOpen = false;
    this.container = null;
    this.circleRefs = [];
    this.tlRefs = [];
    this.activeTweenRefs = [];
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.layout();
    this.bindEvents();
    this.setupViewportHandling();
    
    if (this.config.initialLoadAnimation) {
      this.animateInitialLoad();
    }
  }
  
  setupViewportHandling() {
    // Track viewport height changes for mobile browsers
    let lastViewportHeight = window.innerHeight;
    let isScrolling = false;
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = lastViewportHeight - currentHeight;
      
      // If viewport height decreased (address bar hidden), adjust navbar position
      if (heightDifference > 50) { // Threshold to detect address bar hiding
        this.container.style.bottom = `${heightDifference}px`;
        console.log('Address bar hidden, adjusting navbar position:', heightDifference);
      } else if (heightDifference < -50) { // Address bar shown
        this.container.style.bottom = '0px';
        console.log('Address bar shown, resetting navbar position');
      }
      
      lastViewportHeight = currentHeight;
    };
    
    // Handle scroll events to detect address bar changes
    let scrollTimeout;
    this.handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        handleViewportChange();
      }, 150);
    };
    
    // Handle resize events
    this.handleResize = () => {
      if (!isScrolling) {
        handleViewportChange();
      }
    };
    
    // Handle orientation change
    this.handleOrientationChange = () => {
      setTimeout(handleViewportChange, 500);
    };
    
    // Add event listeners
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleOrientationChange);
    
    // Initial check
    setTimeout(handleViewportChange, 100);
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `pill-nav-container ${this.config.className}`;
    
    const nav = document.createElement('nav');
    nav.className = 'pill-nav';
    nav.setAttribute('aria-label', 'Primary');
    nav.style.cssText = `
      --base: ${this.config.baseColor};
      --pill-bg: ${this.config.pillColor};
      --hover-text: ${this.config.hoveredPillTextColor};
      --pill-text: ${this.config.pillTextColor || this.config.baseColor};
    `;
    
    // Logo
    const logo = this.createLogo();
    nav.appendChild(logo);
    
    // Desktop navigation
    const navItems = this.createNavItems();
    nav.appendChild(navItems);
    
    // Mobile menu button
    const mobileButton = this.createMobileButton();
    nav.appendChild(mobileButton);
    
    this.container.appendChild(nav);
    
    // Mobile menu
    const mobileMenu = this.createMobileMenu();
    this.container.appendChild(mobileMenu);
    
    // Add to page - find the insertion point
    const insertionPoint = document.querySelector('main#uvod').previousElementSibling;
    if (insertionPoint) {
      insertionPoint.insertAdjacentElement('afterend', this.container);
      console.log('PillNav inserted after:', insertionPoint);
    } else {
      document.body.appendChild(this.container);
      console.log('PillNav appended to body');
    }
  }
  
  bindEvents() {
    // Bind events to navigation items
    const navItems = this.container.querySelectorAll('.pill');
    navItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Desktop nav link clicked:', item.dataset.href);
        this.selectPill(index);
        
        const href = item.dataset.href;
        if (href) {
          if (href.startsWith('#')) {
            const target = document.querySelector(href);
            console.log('Desktop target found:', !!target, href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            window.location.href = href;
          }
        }
      });
      
      item.addEventListener('mouseenter', () => this.handleEnter(index));
      item.addEventListener('mouseleave', () => this.handleLeave(index));
    });
    
    // Bind mobile menu events
    const mobileButton = this.container.querySelector('.mobile-menu-button');
    console.log('Mobile button found:', !!mobileButton);
    if (mobileButton) {
      mobileButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile button clicked!');
        this.toggleMobileMenu();
      });
    }
  }
  
  createLogo() {
    const logo = document.createElement('a');
    logo.className = 'pill-logo';
    logo.href = this.config.items[0]?.href || '#';
    logo.setAttribute('aria-label', 'Home');
    
    if (this.config.logo) {
      const img = document.createElement('img');
      img.src = this.config.logo;
      img.alt = this.config.logoAlt;
      logo.appendChild(img);
    } else {
      const text = document.createElement('div');
      text.className = 'logo-text';
      text.textContent = 'F';
      logo.appendChild(text);
    }
    
    logo.addEventListener('mouseenter', () => {
      if (logo.querySelector('img')) {
        logo.querySelector('img').style.transform = 'rotate(360deg)';
      }
    });
    
    return logo;
  }
  
  createNavItems() {
    const navItems = document.createElement('div');
    navItems.className = 'pill-nav-items desktop-only';
    
    const ul = document.createElement('ul');
    ul.className = 'pill-list';
    ul.setAttribute('role', 'menubar');
    
    this.config.items.forEach((item, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      
      const link = document.createElement('a');
      link.href = item.href;
      link.dataset.href = item.href; // Add data-href for bindEvents
      link.dataset.index = i; // Add data-index for selectPill
      link.className = `pill${this.config.activeHref === item.href ? ' is-active' : ''}`;
      link.setAttribute('role', 'menuitem');
      link.setAttribute('aria-label', item.ariaLabel || item.label);
      
      // Hover circle
      const circle = document.createElement('span');
      circle.className = 'hover-circle';
      circle.setAttribute('aria-hidden', 'true');
      this.circleRefs[i] = circle;
      link.appendChild(circle);
      
      // Label stack
      const labelStack = document.createElement('span');
      labelStack.className = 'label-stack';
      
      const label = document.createElement('span');
      label.className = 'pill-label';
      label.textContent = item.label;
      labelStack.appendChild(label);
      
      const hoverLabel = document.createElement('span');
      hoverLabel.className = 'pill-label-hover';
      hoverLabel.setAttribute('aria-hidden', 'true');
      hoverLabel.textContent = item.label;
      labelStack.appendChild(hoverLabel);
      
      link.appendChild(labelStack);
      li.appendChild(link);
      ul.appendChild(li);
      
      // Event listeners
      link.addEventListener('mouseenter', () => this.handleEnter(i));
      link.addEventListener('mouseleave', () => this.handleLeave(i));
    });
    
    navItems.appendChild(ul);
    return navItems;
  }
  
  createMobileButton() {
    const button = document.createElement('button');
    button.className = 'mobile-menu-button mobile-only';
    button.setAttribute('aria-label', 'Toggle menu');
    
    const line1 = document.createElement('span');
    line1.className = 'hamburger-line';
    button.appendChild(line1);
    
    const line2 = document.createElement('span');
    line2.className = 'hamburger-line';
    button.appendChild(line2);
    
    console.log('Mobile menu button created');
    return button;
  }
  
  createMobileMenu() {
    const menu = document.createElement('div');
    menu.className = 'mobile-menu-popover mobile-only';
    
    const ul = document.createElement('ul');
    ul.className = 'mobile-menu-list';
    
    this.config.items.forEach((item, i) => {
      const li = document.createElement('li');
      
      const link = document.createElement('a');
      link.href = item.href;
      link.dataset.href = item.href; // Add data-href for consistency
      link.className = `mobile-menu-link${this.config.activeHref === item.href ? ' is-active' : ''}`;
      link.textContent = item.label;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile menu link clicked:', item.href);
        
        // Close menu immediately
        this.isMobileMenuOpen = false;
        this.updateMobileMenu();
        
        // Handle navigation immediately
        if (item.href.startsWith('#')) {
          const target = document.querySelector(item.href);
          console.log('Target found:', !!target, item.href);
          if (target) {
            // Small delay to ensure menu is closed
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth' });
              console.log('Scrolled to target:', item.href);
            }, 150);
          } else {
            console.error('Target not found:', item.href);
          }
        } else {
          window.location.href = item.href;
        }
      });
      
      // Add touch event for mobile
      link.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile menu link touched:', item.href);
        
        // Close menu immediately
        this.isMobileMenuOpen = false;
        this.updateMobileMenu();
        
        // Handle navigation immediately
        if (item.href.startsWith('#')) {
          const target = document.querySelector(item.href);
          console.log('Target found (touch):', !!target, item.href);
          if (target) {
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth' });
              console.log('Scrolled to target (touch):', item.href);
            }, 150);
          } else {
            console.error('Target not found (touch):', item.href);
          }
        } else {
          window.location.href = item.href;
        }
      });
      
      li.appendChild(link);
      ul.appendChild(li);
    });
    
    menu.appendChild(ul);
    return menu;
  }
  
  layout() {
    this.circleRefs.forEach((circle, i) => {
      if (!circle?.parentElement) return;
      
      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      
      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;
      circle.style.left = '50%';
      circle.style.transform = 'translateX(-50%) scale(0)';
    });
  }
  
  selectPill(index) {
    // Remove active class from all pills
    const allPills = this.container.querySelectorAll('.pill');
    allPills.forEach(pill => pill.classList.remove('active'));
    
    // Add active class to selected pill
    const selectedPill = this.container.querySelector(`.pill[data-index="${index}"]`);
    if (selectedPill) {
      selectedPill.classList.add('active');
    }
    
    // Update active index
    this.activeIndex = index;
  }
  
  handleEnter(i) {
    const circle = this.circleRefs[i];
    if (!circle) return;
    
    // Animate circle
    circle.style.transition = 'all 0.3s ease';
    circle.style.transform = 'translateX(-50%) scale(1.2)';
    circle.style.opacity = '1';
    
    const pill = circle.parentElement;
    const label = pill.querySelector('.pill-label');
    const hoverLabel = pill.querySelector('.pill-label-hover');
    
    // Animate labels
    if (label) {
      label.style.transition = 'all 0.3s ease';
      label.style.transform = 'translateY(-20px)';
      label.style.opacity = '0';
    }
    
    if (hoverLabel) {
      hoverLabel.style.transition = 'all 0.3s ease';
      hoverLabel.style.transform = 'translateY(0)';
      hoverLabel.style.opacity = '1';
    }
    
    // Change pill background color
    pill.style.background = 'var(--accent)';
    pill.style.color = 'var(--accent-contrast)';
  }
  
  handleLeave(i) {
    const circle = this.circleRefs[i];
    if (!circle) return;
    
    // Animate circle
    circle.style.transition = 'all 0.3s ease';
    circle.style.transform = 'translateX(-50%) scale(0)';
    circle.style.opacity = '0';
    
    const pill = circle.parentElement;
    const label = pill.querySelector('.pill-label');
    const hoverLabel = pill.querySelector('.pill-label-hover');
    
    // Animate labels
    if (label) {
      label.style.transition = 'all 0.3s ease';
      label.style.transform = 'translateY(0)';
      label.style.opacity = '1';
    }
    
    if (hoverLabel) {
      hoverLabel.style.transition = 'all 0.3s ease';
      hoverLabel.style.transform = 'translateY(20px)';
      hoverLabel.style.opacity = '0';
    }
    
    // Reset pill background color
    pill.style.background = 'var(--accent-contrast)';
    pill.style.color = 'var(--accent)';
  }
  
  toggleMobileMenu() {
    console.log('Toggle mobile menu clicked, current state:', this.isMobileMenuOpen);
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateMobileMenu();
    this.config.onMobileMenuClick?.();
  }
  
  updateMobileMenu() {
    const button = this.container.querySelector('.mobile-menu-button');
    const menu = this.container.querySelector('.mobile-menu-popover');
    
    console.log('Update mobile menu:', {
      button: !!button,
      menu: !!menu,
      isOpen: this.isMobileMenuOpen
    });
    
    if (button) {
      button.classList.toggle('active', this.isMobileMenuOpen);
    }
    
    if (menu) {
      menu.classList.toggle('show', this.isMobileMenuOpen);
    }
  }
  
  animateInitialLoad() {
    const logo = this.container.querySelector('.pill-logo');
    const navItems = this.container.querySelector('.pill-nav-items');
    
    if (logo) {
      logo.style.transform = 'scale(0)';
      logo.style.transition = 'transform 0.6s ease';
      setTimeout(() => {
        logo.style.transform = 'scale(1)';
      }, 100);
    }
    
    if (navItems) {
      navItems.style.width = '0';
      navItems.style.overflow = 'hidden';
      navItems.style.transition = 'width 0.6s ease';
      setTimeout(() => {
        navItems.style.width = 'auto';
      }, 200);
    }
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.destroy();
    this.init();
  }
  
  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Auto-initialize PillNav
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing PillNav...');
  
  const pillNav = new PillNav({
    items: [
      { label: 'O mně', href: '#o-mne' },
      { label: 'Služby', href: '#sluzby' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Proces', href: '#jak-spolupracujeme' },
      { label: 'Reference', href: '#reference' },
      { label: 'Kontakt', href: '#kontakt' }
    ],
    activeHref: window.location.hash || '#o-mne',
    baseColor: '#000000',
    pillColor: '#ffffff',
    hoveredPillTextColor: '#000000',
    pillTextColor: '#000000'
  });
  
  console.log('PillNav initialized!', pillNav);
  
  // Expose to global scope
  window.pillNav = pillNav;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PillNav };
}
