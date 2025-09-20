// === Theme switcher v2 (smooth) ===
// - Uses View Transitions API for crossfade if available
// - Falls back to CSS variable transitions
// - Persists selection in localStorage

(function(){
  const STORAGE_KEY = 'siteTheme';
  const DEFAULT_THEME = 'moderni';

  function applyTheme(slug){
    document.body.setAttribute('data-theme', slug);
    try { localStorage.setItem(STORAGE_KEY, slug); } catch(e){}
    document.querySelectorAll('.style-pills .pill').forEach(b=>{
      b.setAttribute('aria-pressed', String(b.dataset.theme === slug));
    });
    // Update theme-color for mobile UI
    let meta = document.querySelector('meta[name="theme-color"]');
    if(!meta){ meta = document.createElement('meta'); meta.setAttribute('name','theme-color'); document.head.appendChild(meta); }
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#0ea5e9';
    meta.setAttribute('content', accent);
  }

  function setThemeSmooth(slug){
    // Respect reduced motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => {
      document.body.classList.add('is-theming');
      applyTheme(slug);
          broadcastTheme(slug);
// Remove helper class after a short delay
      setTimeout(()=> document.body.classList.remove('is-theming'), 500);
    };

    if(!reduce && document.startViewTransition){
      // View Transitions crossfade
      document.startViewTransition(start);
    } else {
      start();
    }
  }

  function initTheme(){
    let slug = DEFAULT_THEME;
    try { slug = localStorage.getItem(STORAGE_KEY) || slug; } catch(e){}
    applyTheme(slug);
      broadcastTheme(slug);
}

  function initPills(){
    document.querySelectorAll('.style-pills .pill').forEach(btn=>{
      btn.addEventListener('click', ()=> setThemeSmooth(btn.dataset.theme));
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initTheme();
    
    try {
      const current = document.body.getAttribute('data-theme') || 'moderni';
      broadcastTheme(current);
    } catch(e){};
initPills();
  });

  // Expose for manual changes
  window.setTheme = setThemeSmooth;
})();

function broadcastTheme(slug){
  document.querySelectorAll('iframe').forEach(f=>{
    try { f.contentWindow.postMessage({ type:'theme', value: slug }, '*'); } catch(e){}
  });
  
  // Dispatch themeChanged event for LightRays
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: slug } }));
}
