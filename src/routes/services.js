const express = require('express');
const { db } = require('../db');
const { applyGovernoratePrice } = require('../utils');

const router = express.Router();

function formatService(row, city = '') {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    iconClass: row.icon_class,
    basePrice: row.base_price,
    cityPrice: applyGovernoratePrice(row.base_price, city)
  };
}

router.get('/', (req, res) => {
  const category = String(req.query.category || '').trim();
  const q = String(req.query.q || '').trim().toLowerCase();
  const city = String(req.query.city || '').trim();

  let rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all();

  if (category && category !== 'all') {
    rows = rows.filter((r) => r.category === category);
  }
  if (q) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  res.json({ services: rows.map((row) => formatService(row, city)) });
});

module.exports = router;
