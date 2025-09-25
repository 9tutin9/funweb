Deploy to Vercel (static site + serverless API)

Prerequisites
- Vercel account (https://vercel.com)
- Resend API key (ENV: RESEND_API_KEY)
- Domain funweb.cz verified in Resend (DKIM + SPF + DMARC)

Files added
- vercel.json – builds static files and api/*.js serverless
- api/send-brief.js – endpoint for sending emails via Resend
- emails/* – HTML templates (CZ/EN) for customer and owner
- package.json – dependency resend

Steps
1) Import repository to Vercel
2) Set Environment Variables:
   - RESEND_API_KEY: <your-key>
3) Deploy

Local dev
1) npm i
2) npx vercel dev
App on http://localhost:3000, endpoint POST /api/send-brief.

Notes
- Static site has no build; Vercel serves .html/.css/.js directly.
- If you change SPA fallback, update routes in vercel.json.

