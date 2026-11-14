const express = require('express');
const { db } = require('../db');

const router = express.Router();

function formatReview(row) {
  return {
    id: row.id,
    authorName: row.author_name,
    city: row.city,
    rating: Number(row.rating),
    comment: row.comment,
    tag: row.tag,
    displayDate: row.display_date || null,
    createdAt: row.created_at
  };
}

router.get('/', (req, res) => {
  const rawLimit = Number(req.query.limit);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;

  const rows = db
    .prepare('SELECT * FROM reviews ORDER BY id DESC LIMIT ?')
    .all(limit);

  res.json({ reviews: rows.map(formatReview) });
});

router.post('/', (req, res) => {
  const { authorName, city, rating, comment, tag } = req.body || {};

  const cleanAuthor = String(authorName || '').trim();
  const cleanCity = String(city || '').trim();
  const cleanComment = String(comment || '').trim();
  const cleanTag = String(tag || 'تجربة عميل').trim() || 'تجربة عميل';
  const numRating = Number(rating);

  if (cleanAuthor.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال اسمك بشكل صحيح.' });
  }
  if (cleanCity.length < 2) {
    return res.status(400).json({ error: 'يرجى إدخال المدينة.' });
  }
  if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 و 5 نجوم.' });
  }
  if (cleanComment.length < 5) {
    return res.status(400).json({ error: 'يرجى كتابة تعليق لا يقل عن 5 أحرف.' });
  }

  const userId = req.user ? req.user.id : null;

  const result = db
    .prepare(
      'INSERT INTO reviews (user_id, author_name, city, rating, comment, tag, display_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(userId, cleanAuthor, cleanCity, Math.round(numRating * 10) / 10, cleanComment, cleanTag, null);

  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);

  return res.status(201).json({ review: formatReview(row) });
});

module.exports = router;
