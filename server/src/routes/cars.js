const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all cars with filters
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, seats, transmission } = req.query;
    let query = 'SELECT * FROM cars WHERE available = true';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (minPrice) {
      query += ' AND price_per_day >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND price_per_day <= ?';
      params.push(maxPrice);
    }
    if (seats) {
      query += ' AND seats = ?';
      params.push(seats);
    }
    if (transmission) {
      query += ' AND transmission = ?';
      params.push(transmission);
    }

    const [cars] = await db.query(query, params);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(cars[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Add new car
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const {
    name,
    model,
    year,
    type,
    seats,
    luggage,
    transmission,
    air_conditioning,
    price_per_day,
    image_url,
    description,
    features
  } = req.body;

  try {
    const query = `
      INSERT INTO cars (
        name, model, year, type, seats, luggage, transmission,
        air_conditioning, price_per_day, image_url, description, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      name, model, year, type, seats, luggage, transmission,
      air_conditioning, price_per_day, image_url, description, JSON.stringify(features)
    ]);

    res.status(201).json({ id: result.insertId, message: 'Car added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update car
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const {
    name,
    model,
    year,
    type,
    seats,
    luggage,
    transmission,
    air_conditioning,
    price_per_day,
    image_url,
    description,
    features,
    available
  } = req.body;

  try {
    const query = `
      UPDATE cars SET
        name = ?, model = ?, year = ?, type = ?, seats = ?,
        luggage = ?, transmission = ?, air_conditioning = ?,
        price_per_day = ?, image_url = ?, description = ?,
        features = ?, available = ?
      WHERE id = ?
    `;
    
    await db.query(query, [
      name, model, year, type, seats, luggage, transmission,
      air_conditioning, price_per_day, image_url, description,
      JSON.stringify(features), available, req.params.id
    ]);

    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete car
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 