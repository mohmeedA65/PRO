/* ==========================================================================
   FIXORA — Express server (API + static frontend)
   Run: npm start  →  http://localhost:5000
   ========================================================================== */

require('dotenv').config({ quiet: true });

const path = require('node:path');
const express = require('express');
const cors = require('cors');

const seed = require('./src/seed');
const { optionalAuth } = require('./src/utils');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

/* ---------------------------- Middleware ------------------------------- */

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(optionalAuth);

/* ------------------------------- API ----------------------------------- */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'fixora-api', time: new Date().toISOString() });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/providers', require('./src/routes/providers'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/service-requests', require('./src/routes/service-requests'));
app.use('/api', require('./src/routes/misc')); // /api/stats, /api/estimate

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'المسار غير موجود.' });
});

/* --------------------------- Static frontend --------------------------- */

const send = (file) => (_req, res) => res.sendFile(path.join(ROOT, file));

app.get('/', send('index.html'));
app.get('/index.html', send('index.html'));
app.get('/style.css', send('style.css'));
app.get('/i18n.js', send('i18n.js'));
app.get('/app.js', send('app.js'));
app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.use('/images', express.static(path.join(ROOT, 'images'), { maxAge: '7d' }));

/* ----------------------------- Error handler --------------------------- */

app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'بيانات JSON غير صالحة.' });
  }
  console.error(err);
  res.status(500).json({ error: 'حدث خطأ في الخادم.' });
});

/* -------------------------------- Start -------------------------------- */

seed();

app.listen(PORT, HOST, () => {
  console.log(`\n  Fixora server running: http://${HOST}:${PORT}`);
  console.log(`  API health check:      http://${HOST}:${PORT}/api/health\n`);
});
