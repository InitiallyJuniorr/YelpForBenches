import './Ratings.css';

export default function Ratings({ value = 0, onChange, name = 'rating' }) {
  return (
    <div className="rating">
      {[5, 4, 3, 2, 1].map((rating) => (
        <span key={rating}>
          <input
            checked={Number(value) === rating}
            id={`${name}-${rating}`}
            name={name}
            onChange={() => onChange?.(rating)}
            type="radio"
            value={rating}
          />
          <label htmlFor={`${name}-${rating}`}>★</label>
        </span>
      ))}
    </div>
  );
}
