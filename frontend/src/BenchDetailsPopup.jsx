import './BenchDetailsPopup.css';

function StarRow({ rating = 0, large = false }) {
  const fullStars = Math.round(rating);

  return (
    <div className={large ? 'bench-stars bench-stars-large' : 'bench-stars'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= fullStars ? 'bench-star filled' : 'bench-star'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function BenchDetailsPopup({
  open,
  bench,
  onClose,
  onWriteReview,
}) {
  if (!open || !bench) return null;

  const recentReview = bench.reviews?.[0];

  return (
    <div className="bench-modal-overlay" onClick={onClose}>
      <div
        className="bench-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="bench-modal-close"
          onClick={onClose}
          aria-label="Close bench details"
        >
          ×
        </button>

        <div className="bench-modal-header">
          <img
            className="bench-main-image"
            src={bench.imageURL}
            alt={bench.name}
          />

          <div className="bench-header-content">
            <h2>{bench.name}</h2>
            <p className="bench-address">{bench.address}</p>
            <StarRow rating={bench.avgRating} large />
          </div>
        </div>

        <div className="bench-reviews-section">
          <h3>Recent Reviews</h3>

          {recentReview ? (
            <div className="bench-review-card">
              <div className="bench-review-top">
                <div className="bench-review-avatar-wrap">
                  <img
                    className="bench-review-avatar"
                    src={recentReview.avatarUrl}
                    alt={recentReview.author}
                  />
                </div>

                <div className="bench-review-meta">
                  <div className="bench-review-name">
                    {recentReview.author}
                  </div>
                  <div className="bench-review-badge">
                    {recentReview.badge}
                  </div>

                  <div className="bench-review-rating-row">
                    <StarRow rating={recentReview.rating} />
                    <span className="bench-review-rating-text">
                      {recentReview.rating.toFixed(1)} stars
                    </span>
                  </div>
                </div>
              </div>

              <div className="bench-review-label">My Review</div>

              <div className="bench-review-body">
                {recentReview.preview}
              </div>

              <button
                type="button"
                className="bench-read-review"
              >
                Read full review
              </button>
            </div>
          ) : (
            <div className="bench-no-reviews">
              No reviews yet.
            </div>
          )}
        </div>

        <button
          type="button"
          className="bench-write-review"
          onClick={onWriteReview}
        >
          Write Review
        </button>
      </div>
    </div>
  );
}
