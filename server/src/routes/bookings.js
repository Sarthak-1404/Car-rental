const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { awardPoints } = require('./rewards');

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  const { car_id, start_date, end_date } = req.body;
  const user_id = req.user.id;

  try {
    // Check car availability
    const [cars] = await db.query('SELECT * FROM cars WHERE id = ? AND available = true', [car_id]);
    if (cars.length === 0) {
      return res.status(400).json({ message: 'Car is not available' });
    }

    // Check for overlapping bookings
    const [existingBookings] = await db.query(
      `SELECT * FROM bookings 
       WHERE car_id = ? 
       AND status != 'cancelled'
       AND (
         (start_date BETWEEN ? AND ?) OR
         (end_date BETWEEN ? AND ?) OR
         (start_date <= ? AND end_date >= ?)
       )`,
      [car_id, start_date, end_date, start_date, end_date, start_date, end_date]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Car is already booked for these dates' });
    }

    // Calculate total price
    const car = cars[0];
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total_price = days * car.price_per_day;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        car_id,
        user_id,
        start_date,
        end_date,
        days
      }
    });

    // Create booking
    const [result] = await db.query(
      `INSERT INTO bookings (
        car_id, user_id, start_date, end_date, 
        total_price, payment_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [car_id, user_id, start_date, end_date, total_price, paymentIntent.id]
    );

    res.status(201).json({
      id: result.insertId,
      clientSecret: paymentIntent.client_secret,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT b.*, c.name as car_name, c.model, c.image_url 
      FROM bookings b 
      JOIN cars c ON b.car_id = c.id 
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    const [bookings] = await db.query(query, [req.user.id]);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT b.*, c.name as car_name, c.model, c.image_url,
             u.name as user_name, u.email as user_email
      FROM bookings b 
      JOIN cars c ON b.car_id = c.id 
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `;
    const [bookings] = await db.query(query, [req.params.id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (bookings[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(bookings[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (bookings[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (bookings[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // If payment was made, process refund
    if (bookings[0].payment_status === 'paid') {
      await stripe.refunds.create({
        payment_intent: bookings[0].payment_id
      });
    }

    await db.query(
      'UPDATE bookings SET status = "cancelled", payment_status = "refunded" WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all bookings
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const query = `
      SELECT b.*, c.name as car_name, c.model, c.image_url,
             u.name as user_name, u.email as user_email
      FROM bookings b 
      JOIN cars c ON b.car_id = c.id 
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `;
    const [bookings] = await db.query(query);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  
  try {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    
    // If booking is completed, award points
    if (status === 'completed') {
      await awardPoints(req.params.id);
    }
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 