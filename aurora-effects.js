// Aurora Borealis interaktivní efekty pro Moderní styl
document.addEventListener('DOMContentLoaded', function() {
  function updateAuroraPosition(e) {
    if (document.body.getAttribute('data-theme') === 'moderni') {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', x + '%');
      document.documentElement.style.setProperty('--mouse-y', y + '%');
    }
  }
  
  // Sledování pohybu myši
  document.addEventListener('mousemove', updateAuroraPosition);
  
  // Sledování dotyku na mobilních zařízeních
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      updateAuroraPosition(e.touches[0]);
    }
  });
  
  // Reset pozice při opuštění okna
  document.addEventListener('mouseleave', function() {
    if (document.body.getAttribute('data-theme') === 'moderni') {
      document.documentElement.style.setProperty('--mouse-x', '50%');
      document.documentElement.style.setProperty('--mouse-y', '50%');
    }
  });
  
  console.log('Aurora Borealis effects initialized!');
});
