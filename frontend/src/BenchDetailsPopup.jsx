import { useEffect, useMemo, useState } from 'react';
import './BenchDetailsPopup.css'; import './ResultsPanel.css';
import noBenchImage from './assets/nobenchimage.png';

const RECENT_REVIEW_COUNT = 2;
const REVIEW_PREVIEW_CHARS = 180;

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

function getReviewText(review) { 
  return review.review || '';
}

function getAverageRating(reviews) {
  if (!reviews.length) return 0;

  const totalRating = reviews.reduce(
    (sum, review) => sum + Number(review.rating || review.stars || 0),
    0
  );

  return totalRating / reviews.length;
}

// Component for showing the details of a bench, including its reviews. 
function ReviewCard({ review, expanded, onToggleExpanded }) { 
  const author = review.author || 'Anonymous';
  const fullText = getReviewText(review);
  const needsExpansion =
    fullText.length > REVIEW_PREVIEW_CHARS || review.preview !== fullText; // Show "Read full review" if the review text is longer than the preview

  const reviewText =
    expanded || !needsExpansion
      ? fullText
      : `${fullText.slice(0, REVIEW_PREVIEW_CHARS).trim()}...`; // Show the preview text if not expanded and the full text is longer than the preview

  return (
    <div className="bench-review-card">
      <div className="bench-review-top">
        <div className="bench-review-avatar-wrap">
          {review.avatarUrl ? (
            <img
              className="bench-review-avatar"
              src={review.avatarUrl}
              alt={author}
            />
          ) : (
            <div className="bench-review-avatar-placeholder">
              {author.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="bench-review-meta">
          <div className="bench-review-name">
            {author}
          </div>
          <div className="bench-review-badge">
            {review.badge}
          </div>

          <div className="bench-review-rating-row">
            <StarRow rating={review.rating} />
            <span className="bench-review-rating-text">
              {Number(review.rating || 0).toFixed(1)} stars
            </span>
          </div>
        </div>
      </div>

      <div className="bench-review-label">My Review</div>

      <div className="bench-review-body">
        {reviewText}
      </div>

      {needsExpansion && ( 
        <button
          type="button"
          className="bench-read-review"
          onClick={onToggleExpanded}
        >
          {expanded ? 'Show less' : 'Read full review'}
        </button>
      )}
    </div>
  );
}

export default function BenchDetailsPopup({
  open,
  bench,
  onClose,
  onWriteReview,
}) {
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  useEffect(() => {
    setShowAllReviews(false);
    setExpandedReviewIds([]);
  }, [bench?.id]);

  useEffect(() => {
    if (!open || !bench?.id) {
      setReviews([]);
      setIsLoadingReviews(false);
      setReviewsError('');
      return;
    }

    let ignore = false;
    const fallbackReviews = bench.reviews || [];

    setReviews(fallbackReviews);
    setIsLoadingReviews(true);
    setReviewsError('');

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/bench-reviews?bench_id=${encodeURIComponent(bench.id)}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching reviews: ${response.status}`);
        }

        const data = await response.json();

        if (!ignore) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching bench reviews:', error);

        if (!ignore) {
          setReviewsError('Could not load reviews right now.');
        }
      } finally {
        if (!ignore) {
          setIsLoadingReviews(false);
        }
      }
    };

    fetchReviews();

    return () => {
      ignore = true;
    };
  }, [open, bench?.id, bench?.reviews]);

  // 
  const reviewAverageRating = useMemo(() => getAverageRating(reviews), [reviews]);
  const averageRating = reviewAverageRating || 0;
  const reviewCount = reviews.length || 0;

  if (!open || !bench) return null;

  const visibleReviews = showAllReviews
    ? reviews
    : reviews.slice(0, RECENT_REVIEW_COUNT);

  const hasMoreReviews = reviews.length > RECENT_REVIEW_COUNT;

  // to be passed to component ReviewCard to determine whether to show "Read full review" link
  const toggleExpandedReview = (reviewId) => { 
    setExpandedReviewIds((prevIds) =>
      prevIds.includes(reviewId)
        ? prevIds.filter((id) => id !== reviewId)
        : [...prevIds, reviewId]
    );
  };

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
            src={bench.imageURL || noBenchImage}
            alt={bench.name}
          />

          <div className="bench-header-content">
            <h2>{bench.name}</h2>
            <p className="bench-address">{bench.address}</p>
            <div className="bench-header-rating">
              <StarRow rating={averageRating} large />
              <span className="bench-header-rating-text">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          </div>
        </div>
        
        <div className="bench-reviews-section">
          <h3>Recent Reviews</h3>

          {isLoadingReviews && !visibleReviews.length ? (
            <div className="bench-no-reviews">
              Loading reviews...
            </div>
          ) : visibleReviews.length ? (
            <>
              <div className="bench-review-list">
                {visibleReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    expanded={expandedReviewIds.includes(review.id)}
                    onToggleExpanded={() => toggleExpandedReview(review.id)}
                  />
                ))}
              </div>

              {hasMoreReviews && (
                <button
                  type="button"
                  className="bench-toggle-reviews"
                  onClick={() => setShowAllReviews((prev) => !prev)}
                >
                  {showAllReviews ? 'Show recent reviews' : 'See all reviews'}
                </button>
              )}

              {reviewsError && (
                <div className="bench-review-error">
                  {reviewsError}
                </div>
              )}
            </>
          ) : (
            <div className="bench-no-reviews">
              {reviewsError || 'No reviews yet.'}
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
