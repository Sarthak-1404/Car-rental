const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/database');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification OTP',
    text: `Your OTP for email verification is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const query = 'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [name, email, hashedPassword, phone]);
    
    // Generate and send OTP
    const otp = generateOTP();
    const otpQuery = 'INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))';
    await db.query(otpQuery, [email, otp]);
    await sendOTP(email, otp);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'User registered successfully. Please verify your email.' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const query = 'SELECT * FROM otp WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1';
    const [result] = await db.query(query, [email, otp]);
    
    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user verification status
    await db.query('UPDATE users SET is_verified = true WHERE email = ?', [email]);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [users] = await db.query(query, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        reward_points: user.reward_points
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    const otp = generateOTP();
    const query = 'INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))';
    await db.query(query, [email, otp]);
    await sendOTP(email, otp);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 