
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import HotelForm from '../components/HotelForm';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';

import {
  fetchHotels,
  addHotel,
  deleteHotel
} from '../features/hotels/hotelsSlice';

function HotelList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotels, loading, error } = useSelector(
    (state) => state.hotels
  );

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const hotelsPerPage = 3;

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const handleSaveHotel = async (hotelData, imageFile) => {
    try {
      const formData = new FormData();

      Object.entries(hotelData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await dispatch(addHotel(formData)).unwrap();

      setShowForm(false);
      alert('Hotel added successfully!');
    } catch (err) {
      alert(err || 'Unable to add hotel');
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      await dispatch(deleteHotel(hotelId)).unwrap();
      alert('Hotel deleted successfully!');
    } catch (err) {
      alert(err || 'Unable to delete hotel');
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const price = Number(hotel.price);
    const matchesMin = minPrice === '' || price >= Number(minPrice);
    const matchesMax = maxPrice === '' || price <= Number(maxPrice);

    return matchesSearch && matchesMin && matchesMax;
  });

  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);
  const pageToShow = Math.min(currentPage, Math.max(totalPages, 1));

  const startIndex = (pageToShow - 1) * hotelsPerPage;
  const displayedHotels = filteredHotels.slice(
    startIndex,
    startIndex + hotelsPerPage
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Hotel Management</h1>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : '+ Add Hotel'}
        </button>
      </header>

      {showForm && (
        <HotelForm
          onSave={handleSaveHotel}
          onCancel={() => setShowForm(false)}
        />
      )}

      <section className="filter-section">
        <input
          type="text"
          placeholder="Search hotels by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Minimum price"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setCurrentPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Maximum price"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setCurrentPage(1);
          }}
        />
      </section>

      {loading && <p>Loading hotels...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="hotel-grid">
            {displayedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onView={(id) => navigate(`/hotels/${id}`)}
                onEdit={(id) => navigate(`/hotels/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredHotels.length === 0 && (
            <p className="empty-message">No hotels found.</p>
          )}

          <Pagination
            currentPage={pageToShow}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default HotelList;
