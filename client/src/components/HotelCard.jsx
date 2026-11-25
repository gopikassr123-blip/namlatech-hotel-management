
const API_BASE = 'http://localhost:5000';

function HotelCard({ hotel, onEdit, onDelete, onView }) {
  const imageUrl = hotel.image_path
    ? `${API_BASE}${hotel.image_path}`
    : '/placeholder.png';

  return (
    <article
      className="hotel-card"
      onClick={() => onView(hotel.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onView(hotel.id);
      }}
      role="button"
      tabIndex={0}
    >
      <img
        className="hotel-image"
        src={imageUrl}
        alt={hotel.title}
      />

      <div className="hotel-info">
        <h2>{hotel.title}</h2>

        <p>
          {hotel.description?.length > 100
            ? `${hotel.description.slice(0, 100)}...`
            : hotel.description}
        </p>

        <h3>
          ₹{Number(hotel.price).toLocaleString('en-IN')}
        </h3>

        <div className="hotel-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hotel.id);
            }}
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(hotel.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
