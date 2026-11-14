const express = require('express');
const { db } = require('../db');
const { getProviderSpecialty, doesProviderMatchSpecialty } = require('../utils');

const router = express.Router();

function formatProvider(row) {
  let skills = [];
  try {
    skills = JSON.parse(row.skills_json || '[]');
  } catch {
    skills = [];
  }
  const normalizedSkills = Array.isArray(skills) ? skills : [];
  const specialty = getProviderSpecialty({
    specialty: row.specialty,
    jobTitle: row.job_title,
    skills: normalizedSkills
  });

  return {
    id: row.id,
    userId: row.user_id || null,
    fullname: row.fullname,
    jobTitle: row.job_title,
    specialty,
    city: row.city,
    location: row.location_text || row.city,
    avatar: row.avatar,
    experience: row.experience,
    price: row.price,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    isAvailable: Boolean(row.is_available),
    bio: row.bio || '',
    skills: normalizedSkills
  };
}

router.get('/', (req, res) => {
  const city = String(req.query.city || '').trim();
  const status = String(req.query.status || '').trim().toLowerCase();
  const specialty = String(req.query.specialty || '').trim();
  const q = String(req.query.q || '').trim().toLowerCase();

  let rows = db.prepare('SELECT * FROM providers ORDER BY sort_order ASC, id ASC').all();

  if (city && city !== 'all') {
    rows = rows.filter((r) => r.city === city || (r.location_text && r.location_text.includes(city)));
  }
  if (status === 'online') {
    rows = rows.filter((r) => Boolean(r.is_available));
  } else if (status === 'busy') {
    rows = rows.filter((r) => !r.is_available);
  }
  if (specialty && specialty !== 'all') {
    rows = rows.filter((r) => doesProviderMatchSpecialty(r, specialty));
  }
  if (q) {
    rows = rows.filter(
      (r) =>
        r.fullname.toLowerCase().includes(q) ||
        r.job_title.toLowerCase().includes(q) ||
        (r.specialty && r.specialty.toLowerCase().includes(q)) ||
        r.city.toLowerCase().includes(q)
    );
  }

  res.json({ providers: rows.map(formatProvider) });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'معرف الفني غير صالح.' });
  }
  const row = db.prepare('SELECT * FROM providers WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'لم يتم العثور على الفني المطلوب.' });
  }
  return res.json({ provider: formatProvider(row) });
});

module.exports = router;
