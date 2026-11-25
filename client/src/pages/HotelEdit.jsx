
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import HotelForm from '../components/HotelForm';
import {
  fetchHotels,
  updateHotel
} from '../features/hotels/hotelsSlice';

function HotelEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotels, loading } = useSelector(
    (state) => state.hotels
  );

  useEffect(() => {
    if (hotels.length === 0) {
      dispatch(fetchHotels());
    }
  }, [dispatch, hotels.length]);

  const hotel = hotels.find(
    (item) => String(item.id) === String(id)
  );

  const handleUpdate = async (hotelData, imageFile) => {
    try {
      const formData = new FormData();

      formData.append('title', hotelData.title);
      formData.append('description', hotelData.description);
      formData.append('latitude', hotelData.latitude);
      formData.append('longitude', hotelData.longitude);
      formData.append('price', hotelData.price);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await dispatch(
        updateHotel({
          id,
          formData
        })
      ).unwrap();

      alert('Hotel updated successfully!');
      navigate('/');
    } catch (error) {
      alert(error || 'Unable to update hotel');
    }
  };

  if (loading && !hotel) {
    return <p>Loading hotel details...</p>;
  }

  if (!hotel) {
    return <p>Hotel not found.</p>;
  }

  return (
    <div className="page-container">
      <h1>Edit Hotel</h1>

      <HotelForm
        initialData={{
          ...hotel,
          image: hotel.image_path
            ? `http://localhost:5000${hotel.image_path}`
            : ''
        }}
        onSave={handleUpdate}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}

export default HotelEdit;
