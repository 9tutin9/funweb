(function(){
  'use strict';
  
  // DOM elements
  const el = sel => document.querySelector(sel);
  const els = sel => Array.from(document.querySelectorAll(sel));

  const form = el("#configForm");
  const type = el("#type");
  const pages = el("#pages");
  const cms = el("#cms");
  const copy = el("#copy");
  const seo = el("#seo");
  const lang = el("#lang");
  const speed = el("#speed");
  const integrations = el("#integrations");
  const hosting = el("#hosting");
  const ab = el("#abtest");
  const photos = el("#photos");
  const access = el("#access");

  const priceOut = el("#price");
  const daysOut = el("#days");
  const monthlyOut = el("#monthly");

  const formatter = new Intl.NumberFormat("cs-CZ");

  // State
  let isCalculating = false;

  // Utility functions
  function parseSelectCost(select, attr) {
    const opt = select.options[select.selectedIndex];
    const val = parseFloat(opt.getAttribute(attr) || "0");
    return isNaN(val) ? 0 : val;
  }

  function showLoading() {
    if (isCalculating) return;
    isCalculating = true;
    form.classList.add('loading');
  }

  function hideLoading() {
    isCalculating = false;
    form.classList.remove('loading');
  }

  function animateValue(element, start, end, duration = 300) {
    const startTime = performance.now();
    const startVal = parseFloat(start) || 0;
    const endVal = parseFloat(end) || 0;
    
    function updateValue(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (endVal - startVal) * easeOut;
      
      if (element === priceOut) {
        element.textContent = formatter.format(Math.round(currentVal));
      } else if (element === monthlyOut) {
        element.textContent = formatter.format(Math.round(currentVal));
      } else {
        element.textContent = Math.round(currentVal);
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    }
    
    requestAnimationFrame(updateValue);
  }

  // Main calculation function
  function calculate() {
    if (isCalculating) return;
    
    showLoading();
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        // Base from type
        const base = parseSelectCost(type, "data-base");
        const baseDays = parseSelectCost(type, "data-days");

        // Pages: add cost for additional pages (beyond 1)
        const p = Math.max(1, parseInt(pages.value || "1", 10));
        const perPage = type.value === "starter" ? 1800 : 2500;
        const pagesCost = Math.max(0, p - 1) * perPage;

        // Options with fixed cost
        const cmsCost = parseSelectCost(cms, "data-cost");
        const copyCost = parseSelectCost(copy, "data-cost");
        const seoCost = parseSelectCost(seo, "data-cost");
        const intCost = parseSelectCost(integrations, "data-cost");

        // Addons
        const addons = [ab, photos, access].reduce((sum, cb) => 
          sum + (cb.checked ? parseFloat(cb.getAttribute("data-cost")) : 0), 0);

        // Multipliers
        const langMult = parseFloat(type.value === "starter" && lang.value !== "cz" ? 
          1.15 : (lang.selectedOptions[0].getAttribute("data-mult") || "1"));
        const speedMult = parseFloat(speed.selectedOptions[0].getAttribute("data-mult") || "1");

        // Total one-time
        let total = (base + pagesCost + cmsCost + copyCost + seoCost + intCost + addons);
        total = Math.round(total * langMult * speedMult);

        // Monthly
        const monthly = parseFloat(hosting.selectedOptions[0].getAttribute("data-monthly") || "0");

        // Days
        const fastFactor = speed.value === "fast" ? 0.75 : (speed.value === "express" ? 0.6 : 1);
        const days = Math.max(3, Math.round(baseDays * fastFactor + (p - 1) * (type.value === "starter" ? 0.5 : 1)));

        // Animate values
        const currentPrice = priceOut.textContent.replace(/\s/g, '');
        const currentMonthly = monthlyOut.textContent.replace(/\s/g, '');
        const currentDays = daysOut.textContent;

        animateValue(priceOut, currentPrice, total);
        animateValue(monthlyOut, currentMonthly, monthly);
        animateValue(daysOut, currentDays, days);

        updateURL();
        hideLoading();
        
        return { total, monthly, days };
      } catch (error) {
        console.error('Calculation error:', error);
        hideLoading();
      }
    }, 150);
  }

  function updateURL() {
    try {
      const params = new URLSearchParams(new FormData(form));
      // Add addons explicitly
      params.set("abtest", ab.checked ? "1" : "0");
      params.set("photos", photos.checked ? "1" : "0");
      params.set("access", access.checked ? "1" : "0");
      history.replaceState(null, "", "#" + params.toString());
    } catch (error) {
      console.error('URL update error:', error);
    }
  }

  function restoreFromHash() {
    if (!location.hash) return;
    
    try {
      const q = new URLSearchParams(location.hash.slice(1));
      for (const [k, v] of q.entries()) {
        const input = form.elements[k];
        if (!input) continue;
        
        if (input.type === "checkbox") {
          input.checked = v === "1" || v === "true";
        } else {
          input.value = v;
        }
      }
    } catch (error) {
      console.error('Hash restore error:', error);
    }
  }

  function toContact() {
    try {
      const { total } = calculate();
      if (!total) return;
      
      // Build a suggested budget from total (range around ±20%)
      const min = Math.max(10000, Math.round(total * 0.8 / 1000) * 1000);
      const max = Math.round(total * 1.2 / 1000) * 1000;
      const range = `${min}–${max} Kč`;

      // Create query for your contact page
      const service = type.options[type.selectedIndex].textContent.trim();
      const url = `index.html?service=${encodeURIComponent(service)}&budget=${encodeURIComponent(range)}#kontakt`;
      window.location.href = url;
    } catch (error) {
      console.error('Contact redirect error:', error);
    }
  }

  function shareConfig() {
    try {
      const url = location.href.split("#")[0] + (location.hash || ("#" + new URLSearchParams(new FormData(form)).toString()));
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
          const message = isEnglish 
            ? "Configuration link copied to clipboard." 
            : "Odkaz na konfiguraci zkopírován do schránky.";
          showNotification(message, "success");
        }).catch(() => {
          fallbackShare(url);
        });
      } else {
        fallbackShare(url);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  function fallbackShare(url) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
      const message = isEnglish 
        ? "Link copied to clipboard." 
        : "Odkaz zkopírován do schránky.";
      showNotification(message, "success");
    } catch (err) {
      const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
      const message = isEnglish 
        ? "Copy the link: " + url 
        : "Zkopírujte si odkaz: " + url;
      showNotification(message, "info");
    }
    
    document.body.removeChild(textarea);
  }

  function resetForm() {
    try {
      const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
      const confirmMessage = isEnglish 
        ? "Do you really want to reset all values?" 
        : "Opravdu chcete resetovat všechny hodnoty?";
      if (confirm(confirmMessage)) {
        form.reset();
        calculate();
        history.replaceState(null, "", location.pathname);
        const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
        const message = isEnglish 
          ? "Form has been reset." 
          : "Formulář byl resetován.";
        showNotification(message, "info");
      }
    } catch (error) {
      console.error('Reset error:', error);
    }
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existing = el('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#46bde5'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add CSS for notifications
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Event listeners
  function initEventListeners() {
    // Form inputs
    els("select, input").forEach(input => {
      input.addEventListener("input", calculate);
      input.addEventListener("change", calculate);
    });

    // Buttons
    el("#toContact")?.addEventListener("click", toContact);
    el("#share")?.addEventListener("click", shareConfig);
    el("#reset")?.addEventListener("click", resetForm);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            resetForm();
            break;
          case 's':
            e.preventDefault();
            shareConfig();
            break;
        }
      }
    });
  }

  // Initialize
  function init() {
    try {
      restoreFromHash();
      calculate();
      initEventListeners();
      // Ensure Mailing zdarma when Starter is selected
      if(type && type.value === 'starter'){
        const mailOpt = Array.from(integrations.options).find(o=>o.value==='mailing');
        if(mailOpt){ integrations.value = 'mailing'; }
      }
      
      // Show welcome message
      setTimeout(() => {
        // Check if page is in English
        const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('_en');
        const message = isEnglish 
          ? "Welcome to the configurator! All changes are saved automatically." 
          : "Vítejte v konfigurátoru! Všechny změny se ukládají automaticky.";
        showNotification(message, "info");
      }, 1000);
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();