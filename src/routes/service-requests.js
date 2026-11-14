const express = require('express');
const { db } = require('../db');
const { normalizePhone, isValidPhone, isValidEmail, requireAuth, resolveBookingPrice, doesRequestMatchProvider } = require('../utils');

const router = express.Router();

function formatRequest(row) {
  return {
    id: row.id,
    userId: row.user_id || null,
    providerUserId: row.provider_user_id || null,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email || null,
    serviceTitle: row.service_title,
    providerName: row.provider_name || null,
    city: row.city,
    address: row.address || null,
    scheduledAt: row.scheduled_at,
    notes: row.notes || '',
    estimatedPrice: Number(row.estimated_price) || 0,
    status: row.status,
    createdAt: row.created_at
  };
}

router.post('/', (req, res) => {
  const { clientName, clientPhone, clientEmail, serviceTitle, providerName, promoCode, city, address, scheduledAt, notes } = req.body || {};

  const cleanName = String(clientName || '').trim();
  const cleanPhone = normalizePhone(clientPhone);
  const cleanEmail = clientEmail ? String(clientEmail).trim().toLowerCase() : null;
  const cleanService = String(serviceTitle || '').trim();
  const cleanProvider = providerName ? String(providerName).trim() : null;
  const cleanCity = String(city || '').trim();
  const cleanAddress = address ? String(address).trim() : null;
  const cleanScheduled = String(scheduledAt || '').trim();
  const cleanNotes = String(notes || '').trim();

  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال الاسم بالكامل.' });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ error: 'رقم الهاتف غير صالح. يجب أن يتكون من 10 إلى 15 رقماً.' });
  }
  if (cleanEmail && !isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'صيغة البريد الإلكتروني غير صحيحة.' });
  }
  if (!cleanService) {
    return res.status(400).json({ error: 'يرجى اختيار الخدمة المطلوبة.' });
  }
  if (!cleanCity) {
    return res.status(400).json({ error: 'يرجى تحديد المحافظة.' });
  }
  if (!cleanScheduled) {
    return res.status(400).json({ error: 'يرجى تحديد الموعد المفضل للزيارة.' });
  }

  const serviceRow = db.prepare('SELECT base_price FROM services WHERE title = ?').get(cleanService);
  const providerRow = cleanProvider
    ? db.prepare('SELECT price, user_id FROM providers WHERE fullname = ?').get(cleanProvider)
    : null;

  const { finalPrice } = resolveBookingPrice({
    serviceBasePrice: serviceRow ? serviceRow.base_price : 200,
    providerPrice: providerRow ? providerRow.price : null,
    city: cleanCity,
    promoCode
  });

  const userId = req.user ? req.user.id : null;
  const providerUserId = providerRow && providerRow.user_id ? providerRow.user_id : null;

  const result = db
    .prepare(
      'INSERT INTO service_requests (user_id, provider_user_id, client_name, client_phone, client_email, service_title, provider_name, city, address, scheduled_at, notes, estimated_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(userId, providerUserId, cleanName, cleanPhone, cleanEmail, cleanService, cleanProvider, cleanCity, cleanAddress, cleanScheduled, cleanNotes, finalPrice);

  const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(result.lastInsertRowid);

  return res.status(201).json({ request: formatRequest(row) });
});

router.get('/', requireAuth, (req, res) => {
  if (req.user.role === 'PROVIDER') {
    const availableRows = db
      .prepare("SELECT * FROM service_requests WHERE status = 'NEW' ORDER BY id DESC LIMIT 100")
      .all()
      .filter((row) => doesRequestMatchProvider(row, req.user));
    const assignedRows = db
      .prepare('SELECT * FROM service_requests WHERE provider_user_id = ? OR (provider_user_id IS NULL AND provider_name = ?) ORDER BY id DESC LIMIT 50')
      .all(req.user.id, req.user.fullname);
    return res.json({
      availableRequests: availableRows.map(formatRequest),
      assignedRequests: assignedRows.map(formatRequest)
    });
  }

  const rows = db
    .prepare('SELECT * FROM service_requests WHERE user_id = ? OR (user_id IS NULL AND client_phone = ?) ORDER BY id DESC LIMIT 50')
    .all(req.user.id, req.user.phone);
  return res.json({ requests: rows.map(formatRequest) });
});

router.patch('/:id/accept', requireAuth, (req, res) => {
  if (req.user.role !== 'PROVIDER') {
    return res.status(403).json({ error: 'هذه العملية متاحة لمقدمي الخدمات فقط.' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'معرف الطلب غير صالح.' });
  }

  const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'لم يتم العثور على الطلب.' });
  }
  if (row.status !== 'NEW') {
    return res.status(400).json({ error: 'تم قبول هذا الطلب مسبقاً أو لم يعد متاحاً.' });
  }
  if (!doesRequestMatchProvider(row, req.user)) {
    return res.status(403).json({ error: 'هذا الطلب يخص تخصصاً مختلفاً عن تخصصك المسجل.' });
  }

  db.prepare(
    "UPDATE service_requests SET provider_user_id = ?, provider_name = ?, status = 'PENDING' WHERE id = ?"
  ).run(req.user.id, req.user.fullname, id);

  const updated = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  return res.json({ request: formatRequest(updated) });
});

router.patch('/:id/complete', requireAuth, (req, res) => {
  if (req.user.role !== 'PROVIDER') {
    return res.status(403).json({ error: 'هذه العملية متاحة لمقدمي الخدمات فقط.' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'معرف الطلب غير صالح.' });
  }

  const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'لم يتم العثور على الطلب.' });
  }
  const owns = row.provider_user_id === req.user.id || (row.provider_user_id == null && row.provider_name === req.user.fullname);
  if (!owns) {
    return res.status(403).json({ error: 'غير مصرح لك بإنهاء هذا الطلب.' });
  }
  if (row.status !== 'PENDING' && row.status !== 'NEW') {
    return res.status(400).json({ error: 'لا يمكن إتمام هذا الطلب في حالته الحالية.' });
  }

  db.prepare("UPDATE service_requests SET status = 'COMPLETED', provider_user_id = ? WHERE id = ?").run(req.user.id, id);
  const updated = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  return res.json({ request: formatRequest(updated) });
});

router.patch('/:id/cancel', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'معرف الطلب غير صالح.' });
  }

  const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'لم يتم العثور على الطلب.' });
  }
  const owns = row.user_id === req.user.id || (row.user_id == null && row.client_phone === req.user.phone);
  if (!owns) {
    return res.status(403).json({ error: 'غير مصرح لك بتعديل هذا الطلب.' });
  }
  if (row.status !== 'NEW' && row.status !== 'PENDING') {
    return res.status(400).json({ error: 'لا يمكن إلغاء هذا الطلب في حالته الحالية.' });
  }

  db.prepare("UPDATE service_requests SET status = 'CANCELLED' WHERE id = ?").run(id);
  const updated = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);
  return res.json({ request: formatRequest(updated) });
});

module.exports = router;
