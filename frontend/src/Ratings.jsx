import { useState } from 'react';
import './Ratings.css';

export default function Ratings({ value = 0, onChange, name = 'rating' }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || Number(value) || 0;

  return (
    <div className="rating" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <span key={rating}>
          <input
            checked={Number(value) === rating}
            id={`${name}-${rating}`}
            name={name}
            onChange={() => onChange?.(rating)}
            type="radio"
            value={rating}
          />
          <label
            className={rating <= displayRating ? 'active' : ''}
            htmlFor={`${name}-${rating}`}
            onMouseEnter={() => setHoverRating(rating)}
          >
            ★
          </label>
        </span>
      ))}
    </div>
  );
}
