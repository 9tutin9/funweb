// Aurora Borealis Background Effect
(function() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: Math.random() * 100 + 50,
      maxLife: Math.random() * 100 + 50,
      hue: Math.random() * 60 + 180, // Blue to cyan range
      size: Math.random() * 3 + 1
    };
  }
  
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      if (p.life <= 0) {
        particles.splice(i, 1);
        particles.push(createParticle());
      }
    }
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      const size = p.size * alpha;
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  
  function animate() {
    updateParticles();
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }
  
  function init() {
    // Only show for modern theme
    if (document.body.getAttribute('data-theme') !== 'moderni') {
      canvas.style.display = 'none';
      return;
    }
    
    canvas.style.display = 'block';
    resizeCanvas();
    
    // Don't create particles - just show the gradient background
    // Clear any existing particles
    particles = [];
    
    // Don't start animation for particles
    // animate();
  }
  
  // Listen for theme changes
  function handleThemeChange() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    init();
  }
  
  // Initialize
  window.addEventListener('load', init);
  window.addEventListener('resize', resizeCanvas);
  
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
