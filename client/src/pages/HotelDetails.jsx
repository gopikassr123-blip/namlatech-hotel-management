
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHotels } from '../features/hotels/hotelsSlice';

const API_BASE = 'http://localhost:5000';

function HotelDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  const { hotels, loading, error } = useSelector(
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

  const getCurrentLocation = () => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to detect your location. Please try again.'
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loading && !hotel) {
    return <p>Loading hotel details...</p>;
  }

  if (error && !hotel) {
    return <p>Unable to load hotel details: {error}</p>;
  }

  if (!hotel) {
    return <p>Hotel not found.</p>;
  }

  const latitude = Number(hotel.latitude);
  const longitude = Number(hotel.longitude);

  const validCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const mapUrl = validCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`
    : '';

  const directionsUrl =
    userLocation && validCoordinates
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${latitude},${longitude}`
      : '';

  const imageUrl = hotel.image_path
    ? `${API_BASE}${hotel.image_path}`
    : '/placeholder.png';

  return (
    <div className="page-container">
      <Helmet>
        <title>{hotel.title} | Hotel Management</title>
        <meta name="description" content={hotel.description} />
      </Helmet>

      <button onClick={() => navigate('/')}>
        ← Back to Hotels
      </button>

      <div className="hotel-details">
        <img
          src={imageUrl}
          alt={hotel.title}
          className="hotel-details-image"
        />

        <h1>{hotel.title}</h1>

        <h2>₹{Number(hotel.price).toLocaleString('en-IN')}</h2>

        <p>{hotel.description}</p>

        <h3>Hotel Location</h3>
        <p>Latitude: {hotel.latitude}</p>
        <p>Longitude: {hotel.longitude}</p>

        <button
          onClick={getCurrentLocation}
          disabled={locating}
        >
          {locating ? 'Detecting Location...' : 'Find My Location'}
        </button>

        {locationError && (
          <p className="error-message">{locationError}</p>
        )}

        {userLocation && (
          <div>
            <p>
              Your Location: {userLocation.latitude.toFixed(5)},
              {' '}{userLocation.longitude.toFixed(5)}
            </p>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions to Hotel
            </a>
          </div>
        )}

        {validCoordinates ? (
          <iframe
            title={`${hotel.title} location map`}
            src={mapUrl}
            width="100%"
            height="350"
            style={{ border: 0, marginTop: '15px' }}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <p className="error-message">
            Valid hotel coordinates are not available.
          </p>
        )}
      </div>
    </div>
  );
}

export default HotelDetails;
