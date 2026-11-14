const express = require('express');
const { db } = require('../db');
const { normalizePhone, isValidPhone, requireAuth, resolveBookingPrice } = require('../utils');

const router = express.Router();

function formatBooking(row) {
  return {
    id: row.id,
    serviceTitle: row.service_title,
    providerName: row.provider_name || null,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    city: row.city,
    scheduledAt: row.scheduled_at,
    notes: row.notes || '',
    estimatedPrice: Number(row.estimated_price) || 0,
    status: row.status,
    createdAt: row.created_at
  };
}

router.post('/', (req, res) => {
  const { serviceTitle, providerName, promoCode, clientName, clientPhone, city, scheduledAt, notes } = req.body || {};

  const cleanService = String(serviceTitle || '').trim();
  const cleanProvider = providerName ? String(providerName).trim() : null;
  const cleanName = String(clientName || '').trim();
  const cleanPhone = normalizePhone(clientPhone);
  const cleanCity = String(city || '').trim();
  const cleanScheduled = String(scheduledAt || '').trim();
  const cleanNotes = String(notes || '').trim();

  if (!cleanService) {
    return res.status(400).json({ error: 'يرجى اختيار الخدمة المطلوبة.' });
  }
  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال اسم العميل بالكامل.' });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ error: 'يرجى إدخال رقم هاتف صحيح.' });
  }
  if (!cleanCity) {
    return res.status(400).json({ error: 'يرجى اختيار المحافظة.' });
  }
  if (!cleanScheduled) {
    return res.status(400).json({ error: 'يرجى تحديد الموعد المفضل.' });
  }

  const serviceRow = db.prepare('SELECT base_price FROM services WHERE title = ?').get(cleanService);
  const providerRow = cleanProvider
    ? db.prepare('SELECT price FROM providers WHERE fullname = ?').get(cleanProvider)
    : null;
  const { finalPrice } = resolveBookingPrice({
    serviceBasePrice: serviceRow ? serviceRow.base_price : 200,
    providerPrice: providerRow ? providerRow.price : null,
    city: cleanCity,
    promoCode
  });

  const userId = req.user ? req.user.id : null;

  const result = db
    .prepare(
      'INSERT INTO bookings (user_id, service_title, provider_name, client_name, client_phone, city, scheduled_at, notes, estimated_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(userId, cleanService, cleanProvider, cleanName, cleanPhone, cleanCity, cleanScheduled, cleanNotes, finalPrice);

  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);

  return res.status(201).json({ booking: formatBooking(row) });
});

router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC LIMIT 50')
    .all(req.user.id);
  return res.json({ bookings: rows.map(formatBooking) });
});

module.exports = router;
