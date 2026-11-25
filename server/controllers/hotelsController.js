
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const validateHotel = (data) => {
  const { title, description, latitude, longitude, price } = data;

  if (!title || !title.trim()) {
    return 'Hotel title is required';
  }

  if (!description || !description.trim()) {
    return 'Hotel description is required';
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const amount = Number(price);

  if (
    latitude === undefined ||
    latitude === '' ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90
  ) {
    return 'Invalid latitude';
  }

  if (
    longitude === undefined ||
    longitude === '' ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return 'Invalid longitude';
  }

  if (
    price === undefined ||
    price === '' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 'Price must be greater than zero';
  }

  if (title.trim().length > 150) {
    return 'Hotel title cannot exceed 150 characters';
  }

  return null;
};

// GET all hotels with search, price filters and offset pagination
const getHotels = async (req, res) => {
  try {
    const {
      search = '',
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      offset
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        message: 'Invalid pagination values'
      });
    }

    let offsetNumber;

    if (offset !== undefined) {
      offsetNumber = Number(offset);

      if (!Number.isInteger(offsetNumber) || offsetNumber < 0) {
        return res.status(400).json({
          message: 'Invalid offset value'
        });
      }
    } else {
      if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        return res.status(400).json({
          message: 'Invalid pagination values'
        });
      }

      offsetNumber = (pageNumber - 1) * limitNumber;
    }

    const values = [];
    const conditions = [];

    if (typeof search !== 'string') {
      return res.status(400).json({
        message: 'Invalid search value'
      });
    }

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (minPrice !== undefined && minPrice !== '') {
      const min = Number(minPrice);

      if (!Number.isFinite(min) || min < 0) {
        return res.status(400).json({
          message: 'Invalid minimum price'
        });
      }

      values.push(min);
      conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const max = Number(maxPrice);

      if (!Number.isFinite(max) || max < 0) {
        return res.status(400).json({
          message: 'Invalid maximum price'
        });
      }

      values.push(max);
      conditions.push(`price <= $${values.length}`);
    }

    if (
      minPrice !== undefined &&
      minPrice !== '' &&
      maxPrice !== undefined &&
      maxPrice !== '' &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        message: 'Minimum price cannot exceed maximum price'
      });
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM hotels ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM hotels
       ${whereClause}
       ORDER BY id DESC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, limitNumber, offsetNumber]
    );

    res.status(200).json({
      hotels: result.rows,
      total,
      offset: offsetNumber,
      limit: limitNumber,
      page: Math.floor(offsetNumber / limitNumber) + 1,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch hotels',
      error: error.message
    });
  }
};

// GET hotel by ID
const getHotelById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid hotel ID'
      });
    }

    const result = await pool.query(
      'SELECT * FROM hotels WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      hotel: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch hotel',
      error: error.message
    });
  }
};

// POST create hotel
const addHotel = async (req, res) => {
  try {
    const validationError = validateHotel(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Hotel image is required'
      });
    }

    const { title, description, latitude, longitude, price } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO hotels
       (title, description, latitude, longitude, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        Number(latitude),
        Number(longitude),
        Number(price),
        imagePath
      ]
    );

    res.status(201).json({
      message: 'Hotel added successfully',
      hotel: result.rows[0]
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      message: 'Unable to add hotel',
      error: error.message
    });
  }
};

// PUT update hotel
const updateHotel = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid hotel ID'
      });
    }

    const validationError = validateHotel(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const existing = await pool.query(
      'SELECT * FROM hotels WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: 'Hotel not found'
      });
    }

    const oldHotel = existing.rows[0];

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : oldHotel.image_path;

    const result = await pool.query(
      `UPDATE hotels
       SET title = $1,
           description = $2,
           latitude = $3,
           longitude = $4,
           price = $5,
           image_path = $6
       WHERE id = $7
       RETURNING *`,
      [
        req.body.title.trim(),
        req.body.description.trim(),
        Number(req.body.latitude),
        Number(req.body.longitude),
        Number(req.body.price),
        imagePath,
        id
      ]
    );

    if (req.file && oldHotel.image_path) {
      const oldImage = path.join(
        __dirname,
        '..',
        oldHotel.image_path.replace(/^\/+/, '')
      );

      if (fs.existsSync(oldImage)) {
        fs.unlink(oldImage, () => {});
      }
    }

    res.status(200).json({
      message: 'Hotel updated successfully',
      hotel: result.rows[0]
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      message: 'Unable to update hotel',
      error: error.message
    });
  }
};

// DELETE hotel
const deleteHotel = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid hotel ID'
      });
    }

    const result = await pool.query(
      'DELETE FROM hotels WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Hotel not found'
      });
    }

    const imagePath = result.rows[0].image_path;

    if (imagePath) {
      const fullPath = path.join(
        __dirname,
        '..',
        imagePath.replace(/^\/+/, '')
      );

      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, () => {});
      }
    }

    res.status(200).json({
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to delete hotel',
      error: error.message
    });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  addHotel,
  updateHotel,
  deleteHotel
};
