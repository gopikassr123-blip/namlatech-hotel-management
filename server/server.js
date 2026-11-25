
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/hotels', hotelRoutes);

app.get('/', (req, res) => {
  res.send('Hotel Management API is running!');
});

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

app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        latitude NUMERIC(10,7) NOT NULL,
        longitude NUMERIC(10,7) NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        image_path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Hotels table ready');
    app.listen(PORT, () => {
      console.log('Server running at port ' + PORT);
    });
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

startServer();