// Light Rays Background Effect
(function() {
  function createLightRays() {
    const container = document.querySelector('.light-rays-container');
    if (!container) return;
    
    // Clear existing rays
    container.innerHTML = '';
    
    // Hide light rays for modern theme - only show gradient background
    if (document.body.getAttribute('data-theme') === 'moderni') {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    
    // Create 5 light rays for other themes
    for (let i = 0; i < 5; i++) {
      const ray = document.createElement('div');
      ray.className = 'light-ray';
      container.appendChild(ray);
    }
  }
  
  function init() {
    createLightRays();
  }
  
  // Listen for theme changes
  function handleThemeChange() {
    createLightRays();
  }
  
  // Initialize
  window.addEventListener('load', init);
  
  // Listen for theme changes
  document.addEventListener('click', (e) => {
    if (e.target.matches('.style-pills .pill')) {
      setTimeout(handleThemeChange, 100);
    }
  });
  
  // Also listen for programmatic theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleThemeChange();
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
})();
