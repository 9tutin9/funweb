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
    this.loadAvatar();
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
    
    // Contact button click
    const contactBtn = this.element.querySelector('.profile-card__contact-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onContactClick();
      });
    }
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
      switch (this.status) {
        case 'online':
          responseValue.textContent = '< 1 hodina';
          break;
        case 'away':
          responseValue.textContent = '1-2 hodiny';
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
  
  toggleTilt() {
    this.options.enableTilt = !this.options.enableTilt;
    this.element.classList.toggle('profile-card--tilt-disabled', !this.options.enableTilt);
    
    if (!this.options.enableTilt) {
      this.tilt = { x: 0, y: 0 };
      this.updateTransform();
    }
  }
  
  toggleUserInfo() {
    this.showUserInfo = !this.showUserInfo;
    this.element.classList.toggle('profile-card--user-info-hidden', !this.showUserInfo);
  }
  
  loadAvatar() {
    const avatarElement = this.element.querySelector('.profile-card__avatar-image');
    if (!avatarElement) return;
    
    // Zkus různé přípony obrázků
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const baseName = 'IMG_1620';
    
    // Pokud už má nastavený background-image, neřeš to
    if (avatarElement.style.backgroundImage) return;
    
    // Najdi první existující obrázek
    const findImage = (index = 0) => {
      if (index >= imageExtensions.length) {
        console.log('Žádný obrázek img_1620 nebyl nalezen');
        return;
      }
      
      const imagePath = baseName + imageExtensions[index];
      const img = new Image();
      
      img.onload = () => {
        avatarElement.style.backgroundImage = `url('${imagePath}')`;
        avatarElement.style.backgroundSize = 'cover';
        avatarElement.style.backgroundPosition = 'center';
        console.log(`Avatar načten: ${imagePath}`);
      };
      
      img.onerror = () => {
        findImage(index + 1);
      };
      
      img.src = imagePath;
    };
    
    findImage();
  }
  
  onContactClick() {
    console.log('Contact button clicked!');
    // Add your contact logic here
    alert('Kontaktní tlačítko bylo stisknuto!');
  }
  
  // Public API methods
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
  const profileCardElement = document.getElementById('profileCard');
  
  if (profileCardElement) {
    // Create ProfileCard instance
    const profileCard = new ProfileCard(profileCardElement, {
      enableTilt: true,
      enableMobileTilt: false,
      tiltIntensity: 10
    });
    
    // Demo controls
    const toggleTiltBtn = document.getElementById('toggleTilt');
    const toggleStatusBtn = document.getElementById('toggleStatus');
    const toggleUserInfoBtn = document.getElementById('toggleUserInfo');
    
    if (toggleTiltBtn) {
      toggleTiltBtn.addEventListener('click', () => {
        profileCard.toggleTilt();
        toggleTiltBtn.textContent = profileCard.isTiltEnabled() ? 'Disable Tilt' : 'Enable Tilt';
      });
    }
    
    if (toggleStatusBtn) {
      const statuses = ['online', 'away', 'offline'];
      let currentStatusIndex = 0;
      
      toggleStatusBtn.addEventListener('click', () => {
        currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
        profileCard.setStatus(statuses[currentStatusIndex]);
        toggleStatusBtn.textContent = `Status: ${statuses[currentStatusIndex]}`;
      });
    }
    
    if (toggleUserInfoBtn) {
      toggleUserInfoBtn.addEventListener('click', () => {
        profileCard.toggleUserInfo();
        toggleUserInfoBtn.textContent = profileCard.isUserInfoVisible() ? 'Hide User Info' : 'Show User Info';
      });
    }
    
    // Add some demo interactions
    console.log('ProfileCard initialized!');
    console.log('Available methods:', Object.getOwnPropertyNames(ProfileCard.prototype));
    
    // Expose to global scope for debugging
    window.profileCard = profileCard;
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileCard;
}
