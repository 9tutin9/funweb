// GradualBlur JavaScript Implementation
class GradualBlur {
  constructor(options = {}) {
    this.config = {
      position: 'bottom',
      strength: 2,
      height: '6rem',
      divCount: 5,
      exponential: false,
      zIndex: 1000,
      animated: false,
      duration: '0.3s',
      easing: 'ease-out',
      opacity: 1,
      curve: 'bezier',
      responsive: false,
      target: 'page',
      className: '',
      style: {},
      ...options
    };
    
    this.container = null;
    this.isVisible = true;
    this.isHovered = false;
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.createBlurLayers();
    this.bindEvents();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `gradual-blur glass-effect-${this.config.position} ${this.config.className}`;
    
    const inner = document.createElement('div');
    inner.className = 'gradual-blur-inner';
    this.container.appendChild(inner);
    
    this.container.style.cssText = this.getContainerStyles();
    
    if (this.config.target === 'page') {
      document.body.appendChild(this.container);
    }
  }
  
  getContainerStyles() {
    const isVertical = ['top', 'bottom'].includes(this.config.position);
    const isHorizontal = ['left', 'right'].includes(this.config.position);
    const isPageTarget = this.config.target === 'page';
    
    const baseStyle = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: 'none',
      opacity: this.isVisible ? 1 : 0,
      transition: this.config.animated ? `opacity ${this.config.duration} ${this.config.easing}` : undefined,
      zIndex: isPageTarget ? this.config.zIndex + 100 : this.config.zIndex,
      ...this.config.style
    };
    
    if (isVertical) {
      baseStyle.height = this.config.height;
      baseStyle.width = '100%';
      baseStyle[this.config.position] = '0';
      baseStyle.left = '0';
      baseStyle.right = '0';
    } else if (isHorizontal) {
      baseStyle.width = this.config.height;
      baseStyle.height = '100%';
      baseStyle[this.config.position] = '0';
      baseStyle.top = '0';
      baseStyle.bottom = '0';
    }
    
    return Object.entries(baseStyle)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
  
  createBlurLayers() {
    const inner = this.container.querySelector('.gradual-blur-inner');
    inner.innerHTML = '';
    
    const increment = 100 / this.config.divCount;
    const currentStrength = this.isHovered && this.config.hoverIntensity 
      ? this.config.strength * this.config.hoverIntensity 
      : this.config.strength;
    
    const curveFunc = this.getCurveFunction(this.config.curve);
    
    for (let i = 1; i <= this.config.divCount; i++) {
      let progress = i / this.config.divCount;
      progress = curveFunc(progress);
      
      let blurValue;
      if (this.config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * this.config.divCount + 1) * currentStrength;
      }
      
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
      
      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;
      
      const direction = this.getGradientDirection(this.config.position);
      
      const div = document.createElement('div');
      div.className = 'blur-layer';
      div.style.cssText = `
        position: absolute;
        inset: 0;
        mask-image: linear-gradient(${direction}, ${gradient});
        -webkit-mask-image: linear-gradient(${direction}, ${gradient});
        backdrop-filter: blur(${blurValue.toFixed(3)}rem);
        -webkit-backdrop-filter: blur(${blurValue.toFixed(3)}rem);
        opacity: this.config.opacity;
        transition: ${this.config.animated && this.config.animated !== 'scroll' 
          ? `backdrop-filter ${this.config.duration} ${this.config.easing}` 
          : 'none'};
      `;
      
      inner.appendChild(div);
    }
  }
  
  getCurveFunction(curve) {
    const curves = {
      linear: p => p,
      bezier: p => p * p * (3 - 2 * p),
      'ease-in': p => p * p,
      'ease-out': p => 1 - Math.pow(1 - p, 2),
      'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
    };
    return curves[curve] || curves.linear;
  }
  
  getGradientDirection(position) {
    const directions = {
      top: 'to top',
      bottom: 'to bottom',
      left: 'to left',
      right: 'to right'
    };
    return directions[position] || 'to bottom';
  }
  
  bindEvents() {
    if (this.config.hoverIntensity) {
      this.container.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.updateBlurLayers();
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.updateBlurLayers();
      });
    }
    
    if (this.config.responsive) {
      window.addEventListener('resize', this.debounce(() => {
        this.updateContainerStyles();
      }, 100));
    }
  }
  
  updateBlurLayers() {
    this.createBlurLayers();
  }
  
  updateContainerStyles() {
    this.container.style.cssText = this.getContainerStyles();
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  show() {
    this.isVisible = true;
    this.container.style.opacity = '1';
  }
  
  hide() {
    this.isVisible = false;
    this.container.style.opacity = '0';
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.updateContainerStyles();
    this.updateBlurLayers();
  }
}

// Preset configurations
const PRESETS = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
};

// Utility function to create glass effect
function createGlassEffect(options = {}) {
  const config = { ...PRESETS.footer, ...options };
  return new GradualBlur(config);
}

// Auto-initialize glass effect on page load
document.addEventListener('DOMContentLoaded', function() {
  // Create navbar glass effect (at bottom)
  const navbarGlassEffect = createGlassEffect({
    position: 'bottom',
    height: '8rem',
    strength: 1.5,
    divCount: 4,
    curve: 'ease-out',
    exponential: false,
    opacity: 0.9,
    target: 'page'
  });
  
  // Mobile-specific behavior: adjust position based on scroll
  function adjustMobilePosition() {
    const container = navbarGlassEffect.container;
    // Always keep fixed at bottom on all devices
    container.style.position = 'fixed';
    container.style.bottom = '0px';
    container.style.top = 'auto';
    container.style.left = '0px';
    container.style.right = '0px';
    container.style.width = '100%';
    container.style.opacity = '1';
    container.style.display = 'block';
  }
  
  // Listen for scroll events
  window.addEventListener('scroll', adjustMobilePosition, { passive: true });
  window.addEventListener('resize', adjustMobilePosition, { passive: true });
  
  // Initial adjustment
  adjustMobilePosition();
  
  console.log('Navbar glass effect initialized!');
  
  // Expose to global scope
  window.navbarGlassEffect = navbarGlassEffect;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GradualBlur, createGlassEffect, PRESETS };
}
