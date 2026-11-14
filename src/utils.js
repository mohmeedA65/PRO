const crypto = require('node:crypto');
const { db } = require('./db');

const SESSION_TTL_DAYS = Math.max(1, Number(process.env.SESSION_TTL_DAYS) || 30);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  const derived = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function normalizePhone(phone) {
  return String(phone || '').trim().replace(/[\s\-()]/g, '');
}

function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return /^[0-9]{10,15}$/.test(normalized);
}

function isValidEmail(email) {
  const value = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const GOVERNORATES = [
  { key: 'القاهرة', nameAr: 'القاهرة', nameEn: 'Cairo', multiplier: 1.0, deltaPercent: 0, badgeAr: 'السعر الأساسي', badgeEn: 'Base Rate' },
  { key: 'الجيزة', nameAr: 'الجيزة', nameEn: 'Giza', multiplier: 1.05, deltaPercent: 5, badgeAr: '+5% عن الأساسي', badgeEn: '+5% vs base' },
  { key: 'الإسكندرية', nameAr: 'الإسكندرية', nameEn: 'Alexandria', multiplier: 0.95, deltaPercent: -5, badgeAr: '-5% عن الأساسي', badgeEn: '-5% vs base' },
  { key: 'بورسعيد', nameAr: 'بورسعيد', nameEn: 'Port Said', multiplier: 0.90, deltaPercent: -10, badgeAr: '-10% عن الأساسي', badgeEn: '-10% vs base' },
  { key: 'المنصورة', nameAr: 'المنصورة', nameEn: 'Mansoura', multiplier: 0.85, deltaPercent: -15, badgeAr: '-15% عن الأساسي', badgeEn: '-15% vs base' },
  { key: 'الشرقية', nameAr: 'الشرقية', nameEn: 'Sharqia', multiplier: 0.85, deltaPercent: -15, badgeAr: '-15% عن الأساسي', badgeEn: '-15% vs base' },
  { key: 'طنطا', nameAr: 'طنطا', nameEn: 'Tanta', multiplier: 0.80, deltaPercent: -20, badgeAr: '-20% عن الأساسي', badgeEn: '-20% vs base' },
  { key: 'أسيوط', nameAr: 'أسيوط', nameEn: 'Assiut', multiplier: 0.75, deltaPercent: -25, badgeAr: '-25% عن الأساسي', badgeEn: '-25% vs base' }
];

function getGovernoratePricing(city) {
  const clean = String(city || '').trim();
  if (!clean) return GOVERNORATES[0];
  const lower = clean.toLowerCase();
  const found = GOVERNORATES.find(
    (g) => g.key === clean || g.nameAr === clean || g.nameEn.toLowerCase() === lower
  );
  return found || {
    key: clean,
    nameAr: clean,
    nameEn: clean,
    multiplier: 1.0,
    deltaPercent: 0,
    badgeAr: 'السعر الأساسي',
    badgeEn: 'Base Rate'
  };
}

function applyGovernoratePrice(basePrice, city) {
  const numeric = Number(basePrice);
  const safeBase = Number.isFinite(numeric) && numeric > 0 ? numeric : 200;
  const gov = getGovernoratePricing(city);
  return Math.max(50, Math.round(safeBase * gov.multiplier));
}

function sanitizeUser(row) {
  if (!row) return null;
  let skills = [];
  if (row.skills_json) {
    try {
      const parsed = JSON.parse(row.skills_json);
      if (Array.isArray(parsed)) skills = parsed;
    } catch {
      skills = [];
    }
  }
  return {
    id: row.id,
    fullname: row.fullname,
    email: row.email,
    phone: row.phone,
    role: row.role,
    city: row.city || null,
    jobTitle: row.job_title || null,
    address: row.address || '',
    bio: row.bio || '',
    isAvailable: row.is_available === undefined ? true : Boolean(row.is_available),
    servicePrice: Number(row.service_price) > 0 ? Number(row.service_price) : 200,
    experience: row.experience || '5 سنوات',
    skills,
    status: row.status || 'ACTIVE',
    createdAt: row.created_at
  };
}

function createSession(userId, database = db) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000).toISOString();
  database
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, userId, expiresAt);
  return { token, expiresAt };
}

function extractBearerToken(req) {
  const header = req.headers && req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function optionalAuth(req, _res, next) {
  req.user = null;
  req.token = null;

  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const row = db
      .prepare(`
        SELECT u.*, s.expires_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
      `)
      .get(token);

    if (!row) return next();

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return next();
    }

    req.user = sanitizeUser(row);
    req.token = token;
  } catch (err) {
    console.warn('[Fixora Auth] Session lookup failed:', err.message);
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً.' });
  }
  return next();
}

function calculateEstimate({ basePrice, scope, urgency, city }) {
  const base = Number(basePrice);
  const scopeMult = Number(scope);
  const urgencyExtra = Number(urgency);

  if (!Number.isFinite(base) || base <= 0) {
    return { error: 'قيمة السعر الأساسي غير صالحة.' };
  }
  if (!Number.isFinite(scopeMult) || scopeMult <= 0 || scopeMult > 10) {
    return { error: 'معامل حجم العمل غير صالح.' };
  }
  if (!Number.isFinite(urgencyExtra) || urgencyExtra < 0 || urgencyExtra > 10000) {
    return { error: 'قيمة رسوم الاستعجال غير صالحة.' };
  }

  const gov = getGovernoratePricing(city);
  const adjustedBasePrice = Math.round(base * gov.multiplier);
  const subtotal = Math.round(adjustedBasePrice * scopeMult);
  const totalPrice = Math.round(subtotal + urgencyExtra);

  return {
    basePrice: base,
    adjustedBasePrice,
    city: gov.key,
    cityMultiplier: gov.multiplier,
    cityDeltaPercent: gov.deltaPercent,
    scope: scopeMult,
    urgency: urgencyExtra,
    subtotal,
    totalPrice,
    currency: 'EGP'
  };
}

function resolveBookingPrice({ serviceBasePrice, providerPrice, city, promoCode } = {}) {
  const rawProvider = Number(providerPrice);
  const rawService = Number(serviceBasePrice);
  const rawBase = (Number.isFinite(rawProvider) && rawProvider > 0)
    ? Math.round(rawProvider)
    : ((Number.isFinite(rawService) && rawService > 0) ? Math.round(rawService) : 200);

  const gov = getGovernoratePricing(city);
  const base = Math.round(rawBase * gov.multiplier);

  const normalizedPromo = String(promoCode || '').trim().toUpperCase();
  const hasPromo = normalizedPromo === 'FIX20';
  const discountAmount = hasPromo ? Math.round(base * 0.2) : 0;
  const finalPrice = Math.max(0, base - discountAmount);

  return {
    rawBasePrice: rawBase,
    basePrice: base,
    city: gov.key,
    cityMultiplier: gov.multiplier,
    cityDeltaPercent: gov.deltaPercent,
    discountAmount,
    finalPrice,
    promoApplied: hasPromo,
    currency: 'EGP'
  };
}

module.exports = {
  GOVERNORATES,
  getGovernoratePricing,
  applyGovernoratePrice,
  hashPassword,
  verifyPassword,
  normalizePhone,
  isValidPhone,
  isValidEmail,
  sanitizeUser,
  createSession,
  extractBearerToken,
  optionalAuth,
  requireAuth,
  calculateEstimate,
  resolveBookingPrice
};
