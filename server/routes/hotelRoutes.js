
const express = require('express');
const router = express.Router();

const upload = require('../config/multer');

const {
  getHotels,
  getHotelById,
  addHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelsController');

// Get all hotels
router.get('/', getHotels);

// Get single hotel
router.get('/:id', getHotelById);

// Add hotel with image
router.post('/', upload.single('image'), addHotel);

// Update hotel with optional image
router.put('/:id', upload.single('image'), updateHotel);

// Delete hotel
router.delete('/:id', deleteHotel);

module.exports = router;
