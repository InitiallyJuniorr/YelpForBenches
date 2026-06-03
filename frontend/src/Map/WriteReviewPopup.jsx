import { useEffect, useMemo, useState } from 'react';
import noBenchImage from '../assets/nobenchimage.png';
import './WriteReviewPopup.css';

const MAX_WORDS = 240;

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function ReviewStars({ value, onChange }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || value;

  return (
    <div
      className="write-review-stars"
      aria-label="Review rating"
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          type="button"
          className={rating <= displayRating ? 'active' : ''}
          key={rating}
          onClick={() => onChange(rating)}
          onMouseEnter={() => setHoverRating(rating)}
          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewPopup({
  open,
  bench,
  onClose,
  onSubmit,
}) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!open) {
      setRating(0);
      setReviewText('');
    }
  }, [open]);

  const wordCount = useMemo(() => countWords(reviewText), [reviewText]);

  if (!open || !bench) return null;

  const handleReviewChange = (e) => {
    const nextText = e.target.value;

    if (countWords(nextText) <= MAX_WORDS) {
      setReviewText(nextText);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating || !reviewText.trim()) return;

    onSubmit({
      rating,
      preview: reviewText.trim(),
    });
    onClose();
  };

  return (
    <div className="write-review-overlay" onClick={onClose}>
      <form
        className="write-review-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="write-review-close"
          onClick={onClose}
          aria-label="Close write review"
        >
          X
        </button>

        <div className="write-review-header">
          <img
            className="write-review-image"
            src={bench.imageURL || noBenchImage}
            alt={bench.name}
          />

          <div className="write-review-meta">
            <h2>{bench.name}</h2>
            <p>{bench.address}</p>
            <ReviewStars value={rating} onChange={setRating} />
          </div>
        </div>

        <div className="write-review-input-wrap">
          <textarea
            className="write-review-input"
            placeholder="Write your Review here."
            value={reviewText}
            onChange={handleReviewChange}
            rows={7}
          />
          <div className="write-review-word-count">
            Max {wordCount}/{MAX_WORDS} Words
          </div>
        </div>

        <button
          type="submit"
          className="write-review-submit"
          disabled={!rating || !reviewText.trim()}
        >
          Post Review
        </button>
      </form>
    </div>
  );
}
