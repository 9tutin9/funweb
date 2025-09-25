/*
  Serverless endpoint (Vercel/Netlify-compatible) to send brief submissions via Resend.
  Env: RESEND_API_KEY must be set. From: stefan@funweb.cz (verified in Resend)
*/

const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

function loadTemplate(fileName) {
  const p = path.join(process.cwd(), 'emails', fileName);
  return fs.readFileSync(p, 'utf8');
}

function renderTemplate(tpl, data) {
  return tpl.replace(/\{\{(.*?)\}\}/g, (m, key) => {
    const k = String(key).trim();
    const val = data[k];
    return val === undefined || val === null ? '' : String(val);
  });
}

function makePlainSummary(d) {
  return [
    `Projekt: ${d.brand || '-'}`,
    `Obor: ${d.industry || '-'} | Cíl: ${d.goals || '-'} | Publikum: ${d.audience || '-'}`,
    `Vizuál: ${(d.style || []).join(', ') || '-'} | Barva: ${d.primaryColor || '-'} | Font: ${d.fontVibe || '-'}`,
    `Obsah: ${d.pagesCount || 1} str. | Jazyky: ${d.langs || '-'}`,
    `Mapa: ${d.siteMap || '-'}`,
    `Moduly: ${(d.modules || []).join(', ') || '-'}`,
    `Funkce: ${d.features || '-'}`,
    `Rozpočet: ${d.budget || '-'} | Termín: ${d.deadline || '-'}`,
    `Poznámky: ${d.notes || '-'}`,
    '',
    `Kontakt: ${d.name || '-'} | ${d.email || '-'} | ${d.phone || '-'}`
  ].join('\n');
}

module.exports = async function handler(req, res) {
  try {
    const method = req.method || (req.body ? 'POST' : 'GET');
    if (method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      return res.end('Method Not Allowed');
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      brand, industry, goals, audience, usp, style = [], primaryColor, fontVibe,
      pagesCount, langs, siteMap, modules = [], features, budget, deadline, notes,
      name, email, phone, consent, lang = 'cs'
    } = body || {};

    if (!email || !name) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing required fields (name, email)' }));
    }

    const ownerFrom = 'stefan@funweb.cz';
    const resend = new Resend(process.env.RESEND_API_KEY);

    const dataForTpl = {
      brand, industry, goals, audience, usp,
      primaryColor, fontVibe, pagesCount, langs, siteMap,
      features, budget, deadline, notes,
      name, email, phone, consent,
      style_joined: (style || []).join(', '),
      modules_joined: (modules || []).join(', '),
      plain_summary: makePlainSummary(body),
      owner_from: ownerFrom
    };

    const customerTpl = loadTemplate(lang === 'en' ? 'customer_en.html' : 'customer_cz.html');
    const ownerTpl = loadTemplate(lang === 'en' ? 'owner_en.html' : 'owner_cz.html');

    const customerHtml = renderTemplate(customerTpl, dataForTpl);
    const ownerHtml = renderTemplate(ownerTpl, dataForTpl);

    const subjCustomer = lang === 'en'
      ? `Thanks! Brief received: ${brand || ''}`
      : `Děkuji! Poptávka přijata: ${brand || ''}`;

    const subjOwner = lang === 'en'
      ? `New brief: ${brand || ''}`
      : `Nová poptávka: ${brand || ''}`;

    // Send to customer
    await resend.emails.send({
      from: ownerFrom,
      to: email,
      subject: subjCustomer,
      html: customerHtml,
      reply_to: email
    });

    // Send to owner
    await resend.emails.send({
      from: ownerFrom,
      to: ownerFrom,
      subject: subjOwner,
      html: ownerHtml,
      reply_to: email
    });

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('send-brief error', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to send email' }));
  }
};


