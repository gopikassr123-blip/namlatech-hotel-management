
import { useEffect, useState } from 'react';

function HotelForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    price: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        price: initialData.price || ''
      });

      setImagePreview(initialData.image || '');
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.test(file.name)
    ) {
      setErrors((previous) => ({
        ...previous,
        image: 'Only JPG, PNG and WEBP images are allowed.'
      }));
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image: 'Image size must be below 5 MB.'
      }));
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setErrors((previous) => ({
      ...previous,
      image: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Hotel title is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);
    const price = Number(formData.price);

    if (
      formData.latitude === '' ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      newErrors.latitude = 'Enter a valid latitude (-90 to 90).';
    }

    if (
      formData.longitude === '' ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      newErrors.longitude = 'Enter a valid longitude (-180 to 180).';
    }

    if (
      formData.price === '' ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      newErrors.price = 'Enter a valid price greater than zero.';
    }

    if (!imageFile && !imagePreview) {
      newErrors.image = 'Please select a hotel image.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave(
      {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      },
      imageFile
    );
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Hotel' : 'Add New Hotel'}</h2>

      <label>Hotel Title</label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter hotel title"
      />
      {errors.title && <p className="error-message">{errors.title}</p>}

      <label>Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter hotel description"
        rows="4"
      />
      {errors.description && (
        <p className="error-message">{errors.description}</p>
      )}

      <label>Latitude</label>
      <input
        type="number"
        name="latitude"
        value={formData.latitude}
        onChange={handleChange}
        step="any"
        placeholder="Example: 11.0168"
      />
      {errors.latitude && (
        <p className="error-message">{errors.latitude}</p>
      )}

      <label>Longitude</label>
      <input
        type="number"
        name="longitude"
        value={formData.longitude}
        onChange={handleChange}
        step="any"
        placeholder="Example: 76.9558"
      />
      {errors.longitude && (
        <p className="error-message">{errors.longitude}</p>
      )}

      <label>Price</label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        min="1"
        step="0.01"
        placeholder="Enter price"
      />
      {errors.price && <p className="error-message">{errors.price}</p>}

      <label>Hotel Image</label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleImageChange}
      />

      {errors.image && <p className="error-message">{errors.image}</p>}

      {imagePreview && (
        <div className="image-preview">
          <img
            src={imagePreview}
            alt="Hotel preview"
            style={{ width: '180px', height: '120px', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="submit">
          {initialData ? 'Update Hotel' : 'Save Hotel'}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default HotelForm;
