import { useEffect, useMemo, useState } from 'react';
import noBenchImage from '../assets/nobenchimage.png';
import './WriteReviewPopup.css';

const MAX_WORDS = 240;
const STAR_RATINGS = [1, 2, 3, 4, 5];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length; 
}

function ReviewStars({ value, onChange }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || value;

  return (
    <div
      className="write-review-stars"
      onMouseLeave={() => setHoverRating(0)}
    >
      {STAR_RATINGS.map((star) => (
        <button
          key={star}
          className={star <= displayRating ? 'active' : ''}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewPopup({ open, bench, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const trimmedReviewText = reviewText.trim();
  const wordCount = useMemo(() => countWords(reviewText), [reviewText]);
  const canSubmit = rating > 0 && trimmedReviewText.length > 0;

  const resetForm = () => {
    setRating(0);
    setReviewText('');
  }

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  if (!open || !bench) return null;

  const handleReviewChange = (event) => {
    const nextText = event.target.value;

    if (countWords(nextText) <= MAX_WORDS) {
      setReviewText(nextText);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    onSubmit({
      rating,
      reviewText: trimmedReviewText,
    });
    onClose();
  };

  return (
    
    <div className="write-review-overlay" onClick={onClose}>
     
      <form
        className="write-review-card"
        onClick={(event) => event.stopPropagation()}
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
            {wordCount}/{MAX_WORDS} Words
          </div>
        </div>
        
        <button
          type="submit"
          className="write-review-submit"
          disabled={!canSubmit}
        >
          Post Review
        </button>
      </form>
    </div>
  );
}
