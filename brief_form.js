(function(){
  const form = document.getElementById('briefForm');
  const steps = Array.from(document.querySelectorAll('.step'));
  const bar = document.getElementById('progressBar');
  const summaryPre = document.getElementById('summary');
  const summaryBox = document.getElementById('summaryBox');

  let current = 0;

  function renderProgress(){
    const pct = Math.round(((current+1)/steps.length)*100);
    bar.style.width = pct+'%';
  }

  function showStep(i){
    steps.forEach((s,idx)=> s.classList.toggle('active', idx===i));
    current = i;
    renderProgress();
    if(i === steps.length-1){
      // Fill summary
      renderSummary();
      summaryBox.style.display = 'block';
    } else {
      summaryBox.style.display = 'none';
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function next(){
    if(!validateStep(current)) return;
    if(current < steps.length-1) showStep(current+1);
  }
  function prev(){
    if(current > 0) showStep(current-1);
  }

  function validateStep(i){
    // Basic required fields on step 1 & 6
    if(i===0){
      const required = ['brand','industry','goals'];
      for(const id of required){
        const el = document.getElementById(id);
        if(!el.value.trim()){
          el.focus(); return false;
        }
      }
    }
    if(i===5){
      const email = document.getElementById('email');
      const consent = document.getElementById('consent');
      if(!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)){ email.focus(); return false; }
      if(!consent.checked){ consent.focus(); return false; }
    }
    return true;
  }

  // Chips (style adjectives)
  const chipsWrap = document.getElementById('styleChips');
  const selectedChips = new Set();
  chipsWrap.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-val]');
    if(!btn) return;
    const val = btn.getAttribute('data-val');
    if(selectedChips.has(val)){ selectedChips.delete(val); btn.classList.remove('active'); }
    else{
      if(selectedChips.size>=5) return;
      selectedChips.add(val); btn.classList.add('active');
    }
  });

  // Collect form data
  function collectData(){
    const get = id => document.getElementById(id)?.value?.trim() || '';
    const getInt = id => parseInt(document.getElementById(id)?.value || '0',10);
    const modules = Array.from(document.querySelectorAll('input[name="module"]:checked')).map(i=>i.value);

    return {
      brand: get('brand'),
      industry: get('industry'),
      goals: get('goals'),
      audience: get('audience'),
      usp: get('usp'),
      style: Array.from(selectedChips),
      primaryColor: document.getElementById('primaryColor').value,
      fontVibe: get('fontVibe'),
      inspo: get('inspo').split('\n').map(s=>s.trim()).filter(Boolean),
      pagesCount: getInt('pagesCount'),
      langs: document.getElementById('langs').value,
      siteMap: get('siteMap'),
      contentState: get('contentState'),
      modules,
      features: get('features'),
      budget: document.getElementById('budget').value,
      deadline: document.getElementById('deadline').value,
      notes: get('notes'),
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      consent: document.getElementById('consent').checked
    };
  }

  // ====== Summary rendering (HTML + text) ======
  function renderSummary(){
    const d = collectData();

    // Header - only project info, no customer contact
    document.getElementById('sBrand').textContent = d.brand || '—';
    document.getElementById('sMeta').textContent = [d.industry||'—', d.goals||'—', d.langs||'—'].join(' • ');

    // Logo mark from initials
    const initials = (d.brand||'').split(/\s+/).map(s=>s[0]).join('').slice(0,2).toUpperCase() || 'SK';
    document.getElementById('sLogo').textContent = initials;

    // Visual
    const styleWrap = document.getElementById('sStyle'); styleWrap.innerHTML='';
    (d.style||[]).forEach(s=>{
      const b = document.createElement('div');
      b.className='chip'; b.textContent = s; styleWrap.appendChild(b);
    });
    const color = document.getElementById('sColor'); color.style.background = d.primaryColor || '#0ea5e9';
    document.getElementById('sFont').textContent = d.fontVibe || 'system-ui';

    // Content
    document.getElementById('sPages').textContent = d.pagesCount || 1;
    document.getElementById('sLangs').textContent = d.langs || 'CZ';
    const mapBox = document.getElementById('sMap'); mapBox.innerHTML='';
    const pages = (d.siteMap||'').split(',').map(s=>s.trim()).filter(Boolean);
    (pages.length? pages : ['—']).forEach(t=>{
      const div = document.createElement('div');
      div.className='li'; div.textContent = t; mapBox.appendChild(div);
    });

    // Modules
    const mods = d.modules || [];
    const modsBox = document.getElementById('sModules'); modsBox.innerHTML='';
    (mods.length? mods : ['—']).forEach(t=>{
      const div = document.createElement('div');
      div.className='li'; div.textContent = t; modsBox.appendChild(div);
    });
    document.getElementById('sFeatNote').textContent = d.features ? ('Upřesnění: ' + d.features) : '';

    // Budget & deadline
    document.getElementById('sBudget').textContent = d.budget || '—';
    document.getElementById('sDeadline').textContent = d.deadline || '—';

    // Notes
    document.getElementById('sNotes').textContent = d.notes || '—';

    return d;
  }

  // Copy as plain text (quick)
  function summaryAsText(){
    const d = collectData();
    const lines = [
      `Projekt: ${d.brand}`,
      `Obor: ${d.industry} | Cíl: ${d.goals} | Publikum: ${d.audience||'-'}`,
      ``,
      `Vizuál: ${(d.style||[]).join(', ')||'-'} | Barva: ${d.primaryColor} | Font: ${d.fontVibe}`,
      `Obsah: ${d.pagesCount||1} stránek | Jazyky: ${d.langs}`,
      `Sekce: ${(d.siteMap||'-')}`,
      `Funkce: ${(d.modules||[]).join(', ')||'-'} | Upřesnění: ${d.features||'-'}`,
      `Rozpočet: ${d.budget} | Termín: ${d.deadline}`,
      `Poznámky: ${d.notes||'-'}`,
      ``,
      `Kontaktní údaje zákazníka:`,
      `Jméno: ${d.name||'-'}`,
      `E-mail: ${d.email||'-'}`,
      `Telefon: ${d.phone||'-'}`
    ];
    return lines.join('\n');
  }

  function b64encodeJson(obj){
    const json = JSON.stringify(obj);
    // base64 of UTF-8
    return btoa(unescape(encodeURIComponent(json)));
  }

  // Buttons
  document.querySelectorAll('.next').forEach(b=> b.addEventListener('click', next));
  document.querySelectorAll('.prev').forEach(b=> b.addEventListener('click', prev));

  document.getElementById('btnCopy').addEventListener('click', ()=>{
    const text = summaryAsText();
    navigator.clipboard.writeText(text).then(()=> alert('Souhrn zkopírován do schránky.'));
  });

  document.getElementById('btnPDF').addEventListener('click', ()=>{
    renderSummary();
    window.print();
  });

  document.getElementById('btnPreview').addEventListener('click', ()=>{
    if(!validateStep(5)) return;
    const data = collectData();
    const hash = b64encodeJson(data);
    // Preview functionality removed
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validateStep(5)) return;
    const data = collectData();
    const subject = encodeURIComponent('Nová poptávka z briefu: '+data.brand);
    const body = encodeURIComponent(summaryAsText());
    // Option 1: mailto (rychlé)
    window.location.href = `mailto:stefan@kyzek.cz?subject=${subject}&body=${body}`;
  });

  // Init
  showStep(0);
})();