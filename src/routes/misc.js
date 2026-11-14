const express = require('express');
const { db } = require('../db');
const { GOVERNORATES, calculateEstimate } = require('../utils');

const router = express.Router();

router.get('/governorates', (_req, res) => {
  res.json({ governorates: GOVERNORATES });
});

router.get('/stats', (_req, res) => {
  const servicesCount = db.prepare('SELECT COUNT(*) AS cnt FROM services').get().cnt;
  const providersCount = db.prepare('SELECT COUNT(*) AS cnt FROM providers').get().cnt;
  const reviewsCount = db.prepare('SELECT COUNT(*) AS cnt FROM reviews').get().cnt;
  const bookingsCount = db.prepare('SELECT COUNT(*) AS cnt FROM bookings').get().cnt;
  const requestsCount = db.prepare('SELECT COUNT(*) AS cnt FROM service_requests').get().cnt;
  const avgRow = db.prepare('SELECT AVG(rating) AS avg_rating FROM reviews').get();
  const avgRating = avgRow && avgRow.avg_rating ? Number(avgRow.avg_rating.toFixed(1)) : 4.9;

  res.json({
    customersCount: 15000 + bookingsCount + requestsCount,
    providersCount: 620 + Math.max(0, providersCount - 8),
    completedOrdersCount: 32000 + bookingsCount,
    satisfactionRate: 98,
    averageRating: avgRating,
    liveCounts: {
      services: servicesCount,
      providers: providersCount,
      reviews: reviewsCount,
      bookings: bookingsCount,
      serviceRequests: requestsCount
    }
  });
});

router.post('/estimate', (req, res) => {
  const result = calculateEstimate(req.body || {});
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.json(result);
});

module.exports = router;
