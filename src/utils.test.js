const test = require('node:test');
const assert = require('node:assert/strict');
const {
  GOVERNORATES,
  getGovernoratePricing,
  applyGovernoratePrice,
  hashPassword,
  verifyPassword,
  normalizePhone,
  isValidPhone,
  isValidEmail,
  sanitizeUser,
  calculateEstimate,
  resolveBookingPrice
} = require('./utils');
const { createDatabase } = require('./db');
const seed = require('./seed');

test('hashPassword and verifyPassword round-trip correctly', () => {
  const hash = hashPassword('Fixora#2026');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('Fixora#2026', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
  assert.equal(verifyPassword('Fixora#2026', 'malformed'), false);
});

test('phone and email validation handle Egyptian formats and whitespace', () => {
  assert.equal(normalizePhone(' 010-1234-5678 '), '01012345678');
  assert.equal(isValidPhone('01012345678'), true);
  assert.equal(isValidPhone('12345'), false);
  assert.equal(isValidEmail('user@fixora.eg'), true);
  assert.equal(isValidEmail('invalid-email'), false);
});

test('governorate pricing varies distinctly by governorate', () => {
  assert.ok(GOVERNORATES.length >= 5);
  assert.equal(getGovernoratePricing('القاهرة').multiplier, 1.0);
  assert.equal(getGovernoratePricing('الجيزة').multiplier, 1.05);
  assert.equal(getGovernoratePricing('الإسكندرية').multiplier, 0.95);
  assert.equal(getGovernoratePricing('طنطا').multiplier, 0.8);
  assert.equal(getGovernoratePricing('أسيوط').multiplier, 0.75);

  assert.equal(applyGovernoratePrice(200, 'القاهرة'), 200);
  assert.equal(applyGovernoratePrice(200, 'الجيزة'), 210);
  assert.equal(applyGovernoratePrice(200, 'الإسكندرية'), 190);
  assert.equal(applyGovernoratePrice(200, 'المنصورة'), 170);
  assert.equal(applyGovernoratePrice(200, 'طنطا'), 160);
  assert.equal(applyGovernoratePrice(200, 'أسيوط'), 150);
});

test('calculateEstimate computes rounded total with governorate multiplier and validates bounds', () => {
  const resCairo = calculateEstimate({ basePrice: 200, scope: 1, urgency: 0, city: 'القاهرة' });
  assert.equal(resCairo.adjustedBasePrice, 200);
  assert.equal(resCairo.totalPrice, 200);

  const resTanta = calculateEstimate({ basePrice: 200, scope: 1.5, urgency: 100, city: 'طنطا' });
  assert.equal(resTanta.adjustedBasePrice, 160);
  assert.equal(resTanta.subtotal, 240);
  assert.equal(resTanta.totalPrice, 340);
  assert.equal(resTanta.currency, 'EGP');

  const invalid = calculateEstimate({ basePrice: -10, scope: 1, urgency: 0 });
  assert.ok(invalid.error);
});

test('resolveBookingPrice handles service base price, governorate multiplier, provider override, and FIX20 promo', () => {
  const cairo = resolveBookingPrice({ serviceBasePrice: 200, city: 'القاهرة' });
  assert.equal(cairo.basePrice, 200);
  assert.equal(cairo.finalPrice, 200);

  const tanta = resolveBookingPrice({ serviceBasePrice: 200, city: 'طنطا' });
  assert.equal(tanta.basePrice, 160);
  assert.equal(tanta.finalPrice, 160);

  const provPromo = resolveBookingPrice({ serviceBasePrice: 220, providerPrice: 350, city: 'الجيزة', promoCode: ' fix20 ' });
  assert.equal(provPromo.rawBasePrice, 350);
  assert.equal(provPromo.basePrice, 368);
  assert.equal(provPromo.discountAmount, 74);
  assert.equal(provPromo.finalPrice, 294);
  assert.equal(provPromo.promoApplied, true);
  assert.equal(provPromo.currency, 'EGP');
});

test('sanitizeUser exposes role workspace fields safely without password_hash', () => {
  const user = sanitizeUser({
    id: 7,
    fullname: 'Nour Hassan',
    email: 'nour@fixora.eg',
    phone: '01012345678',
    password_hash: 'secret:hash',
    role: 'PROVIDER',
    city: 'القاهرة',
    address: 'المعادي، شارع 9',
    bio: 'يفضل المواعيد الصباحية',
    is_available: 1,
    service_price: 280,
    experience: '7 سنوات',
    skills_json: JSON.stringify(['كهرباء', 'لوحات']),
    status: 'ACTIVE',
    created_at: '2026-11-14 10:00:00'
  });
  assert.equal(user.fullname, 'Nour Hassan');
  assert.equal(user.address, 'المعادي، شارع 9');
  assert.equal(user.bio, 'يفضل المواعيد الصباحية');
  assert.equal(user.isAvailable, true);
  assert.equal(user.servicePrice, 280);
  assert.deepEqual(user.skills, ['كهرباء', 'لوحات']);
  assert.equal(user.password_hash, undefined);
});

test('seed populates services, providers, reviews, demo accounts, and syncs market prices', () => {
  const memDb = createDatabase(':memory:');
  seed(memDb);
  // Simulate an older DB price and verify seed syncs it to current market prices
  memDb.prepare("UPDATE services SET base_price = 150 WHERE title = 'كهرباء'").run();
  seed(memDb);

  const services = memDb.prepare('SELECT COUNT(*) AS cnt FROM services').get().cnt;
  const providers = memDb.prepare('SELECT COUNT(*) AS cnt FROM providers').get().cnt;
  const reviews = memDb.prepare('SELECT COUNT(*) AS cnt FROM reviews').get().cnt;
  const elec = memDb.prepare("SELECT base_price FROM services WHERE title = 'كهرباء'").get();
  const ac = memDb.prepare("SELECT base_price FROM services WHERE title = 'تكييف وتبريد'").get();
  const demoClient = memDb.prepare("SELECT role FROM users WHERE email = 'client@fixora.eg'").get();
  const demoPro = memDb.prepare("SELECT role FROM users WHERE email = 'pro@fixora.eg'").get();

  assert.equal(services, 12);
  assert.equal(providers, 8);
  assert.equal(reviews, 14);
  assert.equal(elec.base_price, 200);
  assert.equal(ac.base_price, 350);
  assert.equal(demoClient.role, 'CLIENT');
  assert.equal(demoPro.role, 'PROVIDER');

  // Verify new columns exist for user profiles, provider settings, and estimated prices
  const userCols = memDb.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  const reqCols = memDb.prepare('PRAGMA table_info(service_requests)').all().map((c) => c.name);
  assert.ok(userCols.includes('address'));
  assert.ok(userCols.includes('bio'));
  assert.ok(userCols.includes('is_available'));
  assert.ok(userCols.includes('service_price'));
  assert.ok(reqCols.includes('estimated_price'));
  assert.ok(reqCols.includes('provider_name'));
  assert.ok(reqCols.includes('provider_user_id'));
});

