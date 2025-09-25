// Language switcher with geo-based redirect and translations
document.addEventListener('DOMContentLoaded', async () => {
  const langButtons = document.querySelectorAll('.lang-btn');
  const currentPath = window.location.pathname;
  const isEnglishPage = currentPath.includes('index_en.html');
  
  // Get saved language preference first
  const savedLang = localStorage.getItem('site_lang_pref');

  // Function to set active language button
  const setActiveLangButton = (lang) => {
    langButtons.forEach(button => {
      if (button.dataset.lang === lang) {
        button.setAttribute('aria-current', 'true');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  };

  // Load translations from JSON file
  let translationMap = new Map();
  try {
    const response = await fetch('translations_cz_en.json');
    const translationData = await response.json();
    
    // Convert array format to Map for easy lookup
    translationData.forEach(item => {
      if (item.CZ && item.EN) {
        translationMap.set(item.CZ, item.EN);
      }
    });
  } catch (error) {
    console.error('Failed to load translations:', error);
  }

  // Function to get translation
  const getTranslation = (czText, lang) => {
    if (lang === 'cs') return czText;
    return translationMap.get(czText) || czText;
  };

  // Function to apply translations
  const applyTranslations = (lang) => {
    // Elements to translate with their Czech text
    const elementsToTranslate = [
      // Style picker
      { selector: '.style-pills .pill[data-theme="duveryhodny"]', czText: 'Důvěryhodný' },
      { selector: '.style-pills .pill[data-theme="moderni"]', czText: 'Moderní' },
      { selector: '.style-pills .pill[data-theme="minimalisticky"]', czText: 'Minimalistický' },
      
      // Hero section
      { selector: '#hero-eyebrow', czText: 'Web • Grafika • Marketing' },
      { selector: '#hero-title-verb', czText: 'Tvořím' },
      { selector: '#hero-title-rest', czText: ' weby, které prodávají – spojení designu, marketingu a obchodu.' },
      { selector: '#msp-inquiries', czText: 'více poptávek' },
      { selector: '#msp-days', czText: 'k první verzi' },
      { selector: '#msp-pagespeed', czText: 'PageSpeed (MVP)' },
      { selector: '#hero-subhead', czText: 'Navrhnu a postavím moderní a rychlý web, sjednotím vizuální identitu a připravím marketingovou strategii, která dává smysl vašemu byznysu. Osobně, srozumitelně a s důrazem na výsledky.' },
      { selector: '#cta-consultation', czText: 'Domluvit konzultaci zdarma' },
      { selector: '#cta-estimate', czText: 'Kalkulace' },
      { selector: '#trustnote', czText: 'Kombinuji obchodní praxi, grafiku a marketing. Výsledkem je web, který nejen vypadá dobře, ale skutečně prodává.' },
      
      // About section
      { selector: '#about-eyebrow', czText: 'O mně' },
      { selector: '#about-title', czText: 'Rozumím lidem, produktům i podnikání' },
      { selector: '#about-role', czText: 'Freelancer – weby, databáze, marketing' },
      { selector: '#about-intro', czText: 'Specializuji se na kompletní webová řešení s databázemi a automatizací.' },
      { selector: '#about-lead-1', czText: 'Prošel jsem různými prostředími – od prodeje Apple a Xiaomi produktů přes rodinné stavebniny až po tvorbu webů a marketing.' },
      { selector: '#about-lead-2', czText: 'Díky tomu rozumím reálným potřebám zákazníků i firmám různé velikosti.' },
      
      // Portfolio section
      { selector: '#portfolio-eyebrow', czText: 'Portfolio' },
      { selector: '#portfolio-title', czText: 'Ukázky mé práce' },
      { selector: '#portfolio-lead', czText: 'Projekty, které jsem vytvořil pro klienty. Každý web je jedinečný a přizpůsobený potřebám daného byznysu.' },
      
      // Process section
      { selector: '#process-eyebrow', czText: 'Proces' },
      { selector: '#process-title', czText: 'Jak probíhá spolupráce' },
      { selector: '#process-lead', czText: 'Transparentně, krok za krokem. Bez dobré komunikace to nejde – průběžně sdílím práci, ptám se na detaily a vše ladíme společně.' },
      { selector: '#step1-title', czText: 'Úvodní konzultace' },
      { selector: '#step2-title', czText: 'Návrh a plán' },
      { selector: '#step3-title', czText: 'Realizace' },
      { selector: '#step4-title', czText: 'Komunikace & zpětná vazba' },
      { selector: '#step5-title', czText: 'Odevzdání & spuštění' },
      { selector: '#step6-title', czText: 'Podpora & rozvoj' },
      
      // Services section
      { selector: '#services-eyebrow', czText: 'Služby' },
      { selector: '#services-title', czText: 'Kompletní balíček' },
      { selector: '#svc-web-title', czText: 'Webové stránky' },
      { selector: '#svc-db-title', czText: 'Databáze & CRM' },
      { selector: '#svc-email-title', czText: 'E-mailing' },
      { selector: '#svc-gfx-title', czText: 'Grafika' },
      { selector: '#svc-mkt-title', czText: 'Marketing' },
      { selector: '#svc-tech-title', czText: 'Technické služby' },
      
      // Estimator section
      { selector: '#estimator-eyebrow', czText: 'Kalkulace' },
      { selector: '#estimator-title', czText: 'Orientační kalkulace' },
      { selector: '#estimator-card-title', czText: 'Rychlá kalkulace' },
      { selector: '#estimator-starter-label', czText: 'Starter (one-page)' },
      { selector: '#estimator-pro-label', czText: 'Pro (5–8 stránek)' },
      { selector: '#estimator-custom-label', czText: 'Na klíč (custom + CMS)' },
      { selector: '#estimator-full-calculator', czText: 'Otevřít plný kalkulátor' },
      { selector: '#estimator-consult', czText: 'Konzultovat' },
      
      // Contact section
      { selector: '#contact-eyebrow', czText: 'Rychlý start' },
      { selector: '#contact-title', czText: 'Pojďme nastartovat váš web' },
      { selector: '#contact-how-it-works', czText: 'Jak to funguje?' },
      { selector: '#contact-button', czText: 'Domluvit konzultaci zdarma' },
      
      // Footer
      { selector: '#footer-text', czText: '© [aktuální rok] Stefan Kyzek • Weby, databáze, marketing' },
      
      // Profile Card Elements
      { selector: '.profile-card__contact-btn:first-of-type', czText: 'Zavolejte' },
      { selector: '.profile-card__contact-btn:last-of-type', czText: 'Napište' },
      { selector: '.profile-card__info-label:first-of-type', czText: 'Dostupnost' },
      { selector: '.profile-card__info-value--online', czText: 'Dostupný' },
      { selector: '.profile-card__info-label:last-of-type', czText: 'Odezva' },
      
      // Video fallback text
      { selector: 'video', czText: 'Váš prohlížeč nepodporuje video.' },
      
      // Step descriptions and items
      { selector: '#step1-item1', czText: 'Krátký call / meeting (30–45 min)' },
      { selector: '#step1-item2', czText: 'Sepsání zadání a očekávání' },
      { selector: '#step1-item3', czText: 'Předběžný odhad času a rozpočtu' },
      { selector: '#step1-output', czText: 'Výstup: jasný cíl a rozsah' },
      { selector: '#step-next', czText: 'Další krok' },
      { selector: '#step2-item1', czText: 'Informační architektura & wireframe' },
      { selector: '#step2-item2', czText: 'Roadmapa s milníky a termíny' },
      { selector: '#step2-item3', czText: 'Technické požadavky a přístupy' },
      { selector: '#step2-output', czText: 'Výstup: odsouhlasený plán' },
      { selector: '#step3-item1', czText: 'Průběžné náhledy (sdílené odkazy)' },
      { selector: '#step3-item2', czText: 'Rychlé úpravy podle feedbacku' },
      { selector: '#step3-item3', czText: 'Práce v iteracích (sprinty)' },
      { selector: '#step3-output', czText: 'Výstup: funkční prototyp/ukázky' },
      { selector: '#step4-item1', czText: 'Průběžné statusy bez omáčky' },
      { selector: '#step4-item2', czText: 'Rychlé rozhodování na základě ukázek' },
      { selector: '#step4-item3', czText: 'Transparentní přehled úkolů a termínů' },
      { selector: '#step4-output', czText: 'Výstup: žádná překvapení' },
      { selector: '#step5-item1', czText: 'Finální kontrola kvality (rychlost, SEO základ, bezpečnost)' },
      { selector: '#step5-item2', czText: 'Přístupová práva & dokumentace' },
      { selector: '#step5-item3', czText: 'Check-list před spuštěním' },
      { selector: '#step5-output', czText: 'Výstup: projekt připraven k použití' },
      { selector: '#step6-item1', czText: 'Pravidelné reporty a doporučení' },
      { selector: '#step6-item2', czText: 'Iterativní vylepšování výkonu' },
      { selector: '#step6-item3', czText: 'Rychlá technická podpora' },
      { selector: '#step6-output', czText: 'Výstup: udržitelný růst' },
      { selector: '#step-complete', czText: 'Dokončit' },
      
      // Service descriptions and items
      { selector: '#svc-web-desc', czText: 'Píšu weby ručně od nuly, nebo použiji platformy jako Webflow, Shoptet či WordPress – podle vašich cílů a rozpočtu.' },
      { selector: '#svc-web-item1', czText: 'Responzivní a rychlé weby' },
      { selector: '#svc-web-item2', czText: 'SEO základ a analytika' },
      { selector: '#svc-web-item3', czText: 'Copy a struktura obsahu' },
      { selector: '#svc-web-item4', czText: 'Napojení na nástroje' },
      { selector: '#svc-db-desc', czText: 'Vytvořím databázi na míru pro sledování objednávek, zákazníků a obchodních procesů.' },
      { selector: '#svc-db-item1', czText: 'Sledování objednávek' },
      { selector: '#svc-db-item2', czText: 'Zákaznická databáze' },
      { selector: '#svc-db-item3', czText: 'Automatizace procesů' },
      { selector: '#svc-db-item4', czText: 'Reporty a statistiky' },
      { selector: '#svc-email-desc', czText: 'Kompletní e-mailové kampaně a automatizace pro růst vašeho byznysu.' },
      { selector: '#svc-email-item1', czText: 'Newsletter a kampaně' },
      { selector: '#svc-email-item2', czText: 'Automatizace e-mailů' },
      { selector: '#svc-email-item3', czText: 'Segmentace zákazníků' },
      { selector: '#svc-email-item4', czText: 'Analýza otevření a kliků' },
      { selector: '#svc-gfx-desc', czText: 'Vizuální identita, bannery, logotypy a vektorová grafika pro web i tisk.' },
      { selector: '#svc-gfx-item1', czText: 'Logo a brand manuál' },
      { selector: '#svc-gfx-item2', czText: 'Bannery a sociální sítě' },
      { selector: '#svc-gfx-item3', czText: 'Vektorové ilustrace' },
      { selector: '#svc-gfx-item4', czText: 'Podklady pro tisk' },
      { selector: '#svc-mkt-desc', czText: 'Praktické strategie, které dávají smysl vaší cílové skupině a rozpočtu.' },
      { selector: '#svc-mkt-item1', czText: 'Obsah a sociální sítě' },
      { selector: '#svc-mkt-item2', czText: 'Reklama (Meta, Google)' },
      { selector: '#svc-mkt-item3', czText: 'E-mailing a automatizace' },
      { selector: '#svc-mkt-item4', czText: 'Konzultace a mentoring' },
      { selector: '#svc-tech-desc', czText: 'Integrace, API, automatizace a další technické řešení pro váš byznys.' },
      { selector: '#svc-tech-item1', czText: 'API integrace' },
      { selector: '#svc-tech-item2', czText: 'Automatizace procesů' },
      { selector: '#svc-tech-item3', czText: 'Backup a bezpečnost' },
      { selector: '#svc-tech-item4', czText: 'Technická podpora' },
      
      // Bundle text
      { selector: '#bundle-text', czText: 'sjednotím vizuální styl, postavím web a nastavím marketing tak, aby vše fungovalo jako celek.' },
      
      // Estimator section
      { selector: '#estimator-lead', czText: 'Naklikejte si rozsah a ihned uvidíte orientační cenu i termín dodání.' },
      { selector: '#estimator-card-desc', czText: 'Naklikejte si rozsah a ihned uvidíte orientační cenu i termín dodání. Plná verze kalkulátoru obsahuje všechny možnosti a rozšíření.' },
      { selector: '#estimator-starter-item1', czText: '1 stránka (one‑page) s sekcemi' },
      { selector: '#estimator-starter-item2', czText: 'Základní SEO + analytika' },
      { selector: '#estimator-starter-item3', czText: 'Responzivní design' },
      { selector: '#estimator-starter-item4', czText: 'Mailing (zdarma v balíčku Starter)' },
      { selector: '#estimator-starter-item5', czText: 'Napojení na kontaktní formulář' },
      { selector: '#estimator-pro-item1', czText: '5–8 obsahových stránek' },
      { selector: '#estimator-pro-item2', czText: 'Blog/novinky, šablony podstránek' },
      { selector: '#estimator-pro-item3', czText: 'Rozšířená analytika a měření' },
      { selector: '#estimator-pro-item4', czText: 'Rychlostní optimalizace' },
      { selector: '#estimator-custom-item1', czText: 'Vlastní design + komponenty' },
      { selector: '#estimator-custom-item2', czText: 'CMS pro správu obsahu' },
      { selector: '#estimator-custom-item3', czText: 'Integrace nástrojů (CRM, mailing, API)' },
      { selector: '#estimator-custom-item4', czText: 'Konzultace a školení' },
      { selector: '#estimator-disclaimer', czText: 'Uvedené ceny jsou orientační. Finální nabídku zpřesním po krátké konzultaci (15 min).' },
      
      // Contact section
      { selector: '#contact-lead-1', czText: 'Vyplňte krátký dotazník (5 minut) a já se vám hned ozvu s termínem konzultace a návrhem postupu na míru.' },
      { selector: '#contact-lead-2', czText: 'Bez dobré komunikace to nejde – průběžně sdílím práci, ptám se na detaily a vše ladíme společně.' },
      { selector: '#contact-step1', czText: 'Vyplníte 6 jednoduchých kroků (5 minut)' },
      { selector: '#contact-step2', czText: 'Získáte okamžitý náhled webu podle vašich požadavků' },
      { selector: '#contact-step3', czText: 'Na schůzce pak upřesníme detaily' },
      
      // Additional missing elements
      { selector: '.sr-only', czText: 'Přeskočit na obsah' },
      { selector: '.style-pills[aria-label]', czText: 'Výběr stylu' },
      { selector: '#chips-label', czText: 'Technologie a zkušenosti' },
      { selector: '.avatar[aria-label]', czText: 'Fotografie' }
    ];

    // Apply translations to elements
    elementsToTranslate.forEach(({ selector, czText }) => {
      const element = document.querySelector(selector);
      if (element) {
        const translatedText = getTranslation(czText, lang);
        
        // Special handling for footer text with year
        if (selector === '#footer-text') {
          const currentYear = new Date().getFullYear();
          element.innerHTML = translatedText
            .replace('[aktuální rok]', currentYear)
            .replace('[current year]', currentYear);
        } 
        // Special handling for video fallback text
        else if (selector === 'video') {
          // Update all video elements' fallback text
          document.querySelectorAll('video').forEach(video => {
            const fallbackText = video.querySelector('source') ? 
              video.nextSibling : video.lastChild;
            if (fallbackText && fallbackText.nodeType === Node.TEXT_NODE) {
              fallbackText.textContent = translatedText;
            }
          });
        }
        // Special handling for profile card buttons (they have SVG icons)
        else if (selector.includes('.profile-card__contact-btn')) {
          // Keep the SVG icon, only update the text
          const textNode = Array.from(element.childNodes).find(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim()
          );
          if (textNode) {
            textNode.textContent = translatedText;
          }
        }
        // Special handling for aria-label attributes
        else if (selector.includes('[aria-label]')) {
          element.setAttribute('aria-label', translatedText);
        }
        else {
          element.textContent = translatedText;
        }
      }
    });

    // Update document language
    document.documentElement.lang = lang;
    
    // Update portfolio section if it exists
    if (window.portfolioAnimated && typeof window.portfolioAnimated.updateLanguage === 'function') {
      window.portfolioAnimated.updateLanguage(lang);
    } else {
      // Wait for portfolioAnimated to load
      setTimeout(() => {
        if (window.portfolioAnimated && typeof window.portfolioAnimated.updateLanguage === 'function') {
          window.portfolioAnimated.updateLanguage(lang);
        }
      }, 100);
    }
  };

  // Language button click handlers
  langButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = button.dataset.lang;
      
      // Always save language preference globally
      localStorage.setItem('site_lang_pref', lang);
      
      if (lang === 'en' && !isEnglishPage) {
        // Redirect to English page
        window.location.href = 'index_en.html';
      } else if (lang === 'cs' && isEnglishPage) {
        // Redirect to Czech page
        window.location.href = 'index.html';
      } else {
        // Apply translations on current page
        applyTranslations(lang);
        setActiveLangButton(lang);
      }
    });
  });

  // Auto-detect language on first visit
  if (!savedLang) {
    // Simple geo detection - redirect non-CZ/SK users to English
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isCzSk = timezone.includes('Prague') || timezone.includes('Bratislava') || 
                   navigator.language.startsWith('cs') || navigator.language.startsWith('sk');
    
    if (!isCzSk && !isEnglishPage) {
      window.location.href = 'index_en.html';
      return;
    }
  }

  // Set initial language based on saved preference or page
  let initialLang = savedLang || 'cs';
  
  // If we have a saved preference, use it regardless of current page
  if (savedLang) {
    if (savedLang === 'en' && !isEnglishPage) {
      // Redirect to English page if preference is EN but we're on CZ page
      window.location.href = 'index_en.html';
      return;
    } else if (savedLang === 'cs' && isEnglishPage) {
      // Redirect to Czech page if preference is CS but we're on EN page
      window.location.href = 'index.html';
      return;
    }
    initialLang = savedLang;
  } else {
    // No saved preference, use page-based detection
    initialLang = isEnglishPage ? 'en' : 'cs';
  }
  
  applyTranslations(initialLang);
  setActiveLangButton(initialLang);

  // Update year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});