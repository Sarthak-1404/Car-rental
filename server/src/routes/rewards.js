const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's reward points
router.get('/my-points', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT reward_points FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ points: users[0].reward_points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's reward history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT r.*, b.start_date, b.end_date, c.name as car_name
      FROM rewards r
      JOIN bookings b ON r.booking_id = b.id
      JOIN cars c ON b.car_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rewards] = await db.query(query, [req.user.id]);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate and award points for a completed booking
async function awardPoints(bookingId) {
  try {
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) return;

    const booking = bookings[0];
    const points = Math.floor(booking.total_price * 0.1); // 10% of total price as points

    // Start transaction
    await db.query('START TRANSACTION');

    // Add points to user
    await db.query(
      'UPDATE users SET reward_points = reward_points + ? WHERE id = ?',
      [points, booking.user_id]
    );

    // Record reward
    await db.query(
      'INSERT INTO rewards (user_id, points_earned, booking_id) VALUES (?, ?, ?)',
      [booking.user_id, points, bookingId]
    );

    // Create notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, 'Points Earned', ?, 'reward')`,
      [booking.user_id, `You earned ${points} points for your booking!`]
    );

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

module.exports = router;
module.exports.awardPoints = awardPoints; 