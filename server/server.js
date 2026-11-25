
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const pool = require('./config/db');
const hotelRoutes = require('./routes/hotelRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Hotel API routes
app.use('/api/hotels', hotelRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Hotel Management API is running!');
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'PostgreSQL 18 connected successfully!',
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
