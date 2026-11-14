const express = require('express');
const { db } = require('../db');
const {
  hashPassword,
  verifyPassword,
  normalizePhone,
  isValidPhone,
  isValidEmail,
  sanitizeUser,
  createSession,
  requireAuth
} = require('../utils');

const router = express.Router();

router.post('/register', (req, res) => {
  const { fullname, phone, email, password, role, city, jobTitle } = req.body || {};

  const cleanName = String(fullname || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);
  const cleanPassword = String(password || '');
  const cleanCity = city ? String(city).trim() : null;
  const cleanRole = String(role || 'CLIENT').toUpperCase() === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';
  const cleanJobTitle = jobTitle ? String(jobTitle).trim() : null;

  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال الاسم بالكامل بشكل صحيح.' });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ error: 'رقم الهاتف غير صالح. يجب أن يتكون من 10 إلى 15 رقماً.' });
  }
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'البريد الإلكتروني غير صالح.' });
  }
  if (cleanPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.' });
  }

  const existing = db
    .prepare('SELECT id, email, phone FROM users WHERE LOWER(email) = ? OR phone = ?')
    .get(cleanEmail, cleanPhone);

  if (existing) {
    const field = existing.email.toLowerCase() === cleanEmail ? 'البريد الإلكتروني' : 'رقم الهاتف';
    return res.status(409).json({ error: `${field} مسجل بالفعل في المنصة.` });
  }

  const passwordHash = hashPassword(cleanPassword);
  const status = cleanRole === 'PROVIDER' ? 'PENDING_REVIEW' : 'ACTIVE';

  const result = db
    .prepare(
      'INSERT INTO users (fullname, email, phone, password_hash, role, city, job_title, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(cleanName, cleanEmail, cleanPhone, passwordHash, cleanRole, cleanCity, cleanJobTitle, status);

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  const { token } = createSession(userRow.id);

  return res.status(201).json({
    token,
    user: sanitizeUser(userRow)
  });
});

router.post('/login', (req, res) => {
  const { identifier, email, phone, password } = req.body || {};
  const rawIdentifier = String(identifier || email || phone || '').trim();
  const cleanPassword = String(password || '');

  if (!rawIdentifier || !cleanPassword) {
    return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور.' });
  }

  const normalizedEmail = rawIdentifier.toLowerCase();
  const normalizedPhone = normalizePhone(rawIdentifier);

  const userRow = db
    .prepare('SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?')
    .get(normalizedEmail, normalizedPhone);

  if (!userRow || !verifyPassword(cleanPassword, userRow.password_hash)) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة.' });
  }

  const { token } = createSession(userRow.id);

  return res.json({
    token,
    user: sanitizeUser(userRow)
  });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

function mapRequestRow(r) {
  return {
    id: r.id,
    userId: r.user_id || null,
    providerUserId: r.provider_user_id || null,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    clientEmail: r.client_email || null,
    serviceTitle: r.service_title,
    providerName: r.provider_name || null,
    city: r.city,
    address: r.address || null,
    scheduledAt: r.scheduled_at,
    notes: r.notes || '',
    estimatedPrice: Number(r.estimated_price) || 0,
    status: r.status,
    createdAt: r.created_at
  };
}

router.get('/profile', requireAuth, (req, res) => {
  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const user = sanitizeUser(userRow);

  if (user.role === 'PROVIDER') {
    const availableRequests = db
      .prepare(
        `SELECT * FROM service_requests
         WHERE status = 'NEW' AND (provider_user_id IS NULL OR provider_user_id = ?)
         ORDER BY CASE WHEN city = ? THEN 0 ELSE 1 END, id DESC LIMIT 50`
      )
      .all(req.user.id, user.city || '')
      .map(mapRequestRow);

    const assignedRequests = db
      .prepare(
        `SELECT * FROM service_requests
         WHERE provider_user_id = ? OR (provider_user_id IS NULL AND provider_name = ?)
         ORDER BY id DESC LIMIT 50`
      )
      .all(req.user.id, user.fullname)
      .map(mapRequestRow);

    const activeJobsCount = assignedRequests.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length;
    const completedJobs = assignedRequests.filter((r) => r.status === 'COMPLETED');
    const totalEarnings = completedJobs.reduce((sum, r) => sum + (Number(r.estimatedPrice) || 0), 0);

    return res.json({
      user,
      requests: assignedRequests,
      availableRequests,
      assignedRequests,
      bookings: [],
      stats: {
        availableCount: availableRequests.length,
        activeJobsCount,
        completedJobsCount: completedJobs.length,
        totalEarnings,
        totalRequests: assignedRequests.length,
        activeRequests: activeJobsCount,
        completedRequests: completedJobs.length
      }
    });
  }

  const requests = db
    .prepare(
      `SELECT * FROM service_requests
       WHERE user_id = ? OR (user_id IS NULL AND client_phone = ?)
       ORDER BY id DESC LIMIT 50`
    )
    .all(req.user.id, user.phone)
    .map(mapRequestRow);

  const bookings = db
    .prepare(
      `SELECT * FROM bookings
       WHERE user_id = ? OR (user_id IS NULL AND client_phone = ?)
       ORDER BY id DESC LIMIT 50`
    )
    .all(req.user.id, user.phone)
    .map((b) => ({
      id: b.id,
      serviceTitle: b.service_title,
      providerName: b.provider_name || null,
      clientName: b.client_name,
      clientPhone: b.client_phone,
      city: b.city,
      scheduledAt: b.scheduled_at,
      notes: b.notes || '',
      estimatedPrice: Number(b.estimated_price) || 0,
      status: b.status,
      createdAt: b.created_at
    }));

  const activeCount = requests.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const totalEstimatedSpend = requests
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((sum, r) => sum + (Number(r.estimatedPrice) || 0), 0);

  return res.json({
    user,
    requests,
    bookings,
    stats: {
      totalRequests: requests.length,
      activeRequests: activeCount,
      completedRequests: completedCount,
      totalEstimatedSpend
    }
  });
});

router.patch('/profile', requireAuth, (req, res) => {
  const { fullname, phone, city, address, bio, jobTitle, isAvailable, servicePrice, experience, skills } = req.body || {};

  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!current) {
    return res.status(404).json({ error: 'المستخدم غير موجود.' });
  }

  const cleanName = fullname !== undefined ? String(fullname).trim() : current.fullname;
  const cleanPhone = phone !== undefined ? normalizePhone(phone) : current.phone;
  const cleanCity = city !== undefined ? (String(city).trim() || null) : current.city;
  const cleanAddress = address !== undefined ? String(address).trim().slice(0, 240) : (current.address || '');
  const cleanBio = bio !== undefined ? String(bio).trim().slice(0, 500) : (current.bio || '');
  const cleanJobTitle = current.role === 'PROVIDER' && jobTitle !== undefined
    ? (String(jobTitle).trim().slice(0, 120) || current.job_title)
    : current.job_title;

  const cleanAvailable = current.role === 'PROVIDER' && isAvailable !== undefined
    ? (isAvailable ? 1 : 0)
    : (current.is_available !== undefined ? current.is_available : 1);

  let cleanPrice = Number(current.service_price) || 200;
  if (current.role === 'PROVIDER' && servicePrice !== undefined) {
    const parsedPrice = Math.round(Number(servicePrice));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 50 || parsedPrice > 20000) {
      return res.status(400).json({ error: 'يرجى إدخال سعر زيارة صالح بين 50 و 20000 جنيه.' });
    }
    cleanPrice = parsedPrice;
  }

  const cleanExperience = current.role === 'PROVIDER' && experience !== undefined
    ? (String(experience).trim().slice(0, 60) || current.experience || '5 سنوات')
    : (current.experience || '5 سنوات');

  let cleanSkillsJson = current.skills_json || '[]';
  if (current.role === 'PROVIDER' && skills !== undefined) {
    const arr = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 10)
      : String(skills || '').split(/[,،\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 10);
    cleanSkillsJson = JSON.stringify(arr);
  }

  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال الاسم بالكامل بشكل صحيح.' });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ error: 'رقم الهاتف غير صالح. يجب أن يتكون من 10 إلى 15 رقماً.' });
  }

  const phoneConflict = db
    .prepare('SELECT id FROM users WHERE phone = ? AND id != ?')
    .get(cleanPhone, req.user.id);
  if (phoneConflict) {
    return res.status(409).json({ error: 'رقم الهاتف مسجل بالفعل لحساب آخر.' });
  }

  db.prepare(
    'UPDATE users SET fullname = ?, phone = ?, city = ?, address = ?, bio = ?, job_title = ?, is_available = ?, service_price = ?, experience = ?, skills_json = ? WHERE id = ?'
  ).run(cleanName, cleanPhone, cleanCity, cleanAddress, cleanBio, cleanJobTitle, cleanAvailable, cleanPrice, cleanExperience, cleanSkillsJson, req.user.id);

  if (current.role === 'PROVIDER') {
    const linkedProvider = db.prepare('SELECT id FROM providers WHERE user_id = ?').get(req.user.id);
    if (linkedProvider) {
      const locText = cleanAddress ? `${cleanCity || 'القاهرة'} — ${cleanAddress}` : (cleanCity || 'القاهرة');
      db.prepare(
        'UPDATE providers SET fullname = ?, job_title = ?, city = ?, location_text = ?, price = ?, is_available = ?, bio = ?, experience = ?, skills_json = ? WHERE user_id = ?'
      ).run(cleanName, cleanJobTitle || 'فني صيانة منزلية', cleanCity || 'القاهرة', locText, cleanPrice, cleanAvailable, cleanBio, cleanExperience, cleanSkillsJson, req.user.id);
    }
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user: sanitizeUser(updated) });
});

router.post('/logout', (req, res) => {
  if (req.token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
  }
  return res.json({ ok: true });
});

module.exports = router;
