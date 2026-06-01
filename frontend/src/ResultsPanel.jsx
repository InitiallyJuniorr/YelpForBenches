import './ResultsPanel.css';
import noBenchImage from "./assets/nobenchimage.png";

function StarRating({ rating = 0 }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <div className="bench-card-stars" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={`bench-card-star ${star <= roundedRating ? 'filled' : ''}`}
          key={star}
        >
        </span>
      ))}
    </div>
  );
}

function LocationCard({ title, address, onClick, isSelected }) {
  return (
    <button
      type="button"
      className={`location-card result-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <h3 className="bench-card-title">{title}</h3>
      <p className="location-card-address">{address}</p>
    </button>
  );
}

function BenchCard({ bench, onClick, isSelected }) {
  const hasImage = Boolean(bench.imageURL);
  const coordinateText = `${bench.lat.toFixed(5)}, ${bench.lng.toFixed(5)}`;

  return (
    <button
      type="button"
      className={`bench-card result-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="bench-card-info">
        <h3 className="bench-card-title">{bench.name || 'Untitled Bench'}</h3>
        <p className="bench-card-address">{coordinateText}</p>

        <div className="bench-card-rating">
          <StarRating rating={bench.avgRating} />
          <span className="bench-card-rating-text">
            {(Number(bench.avgRating) || 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="result-image-wrap">
        {hasImage ? (
          <img
            className="bench-card-image"
            src={bench.imageURL}
            alt={bench.name}
          />
        ) : (
          <img
            className="bench-card-image"
            src={noBenchImage}
            alt={'No Bench Image'}
          />
        )}
      </div>
    </button>
  );
}

export default function ResultsPanel({
  query,
  setQuery,
  results = [],
  selectedBenchId = null,
  onSearch,
  onClear,
  //onSelectPlace,
  onSelectBench,
  loading = false,
  onAddBench,
}) {
  const safeResults = Array.isArray(results) ? results : [];
  const safeQuery = query ?? '';

  return (
    <div className="results-panel">

      <div className="search-box">
        <span className="search-icon" />
        <input
          className="search-input"
          type="text"
          value={safeQuery}
          placeholder={'Search benches'}
          onChange={(e) => setQuery?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch?.();
            }
          }}
        />

        <button
          type="button"
          className="icon-btn"
          onClick={onSearch}
        >
          Search
        </button>

        <button
          type="button"
          className="clear-button"
          onClick={onClear}
        >
          X
        </button>
      </div>

      <div className="results-header">
        <h2 className="results-title">
          {'Nearby Benches'}
        </h2>
      </div>

      <div className="results-list">
        {loading && (
          <div className="results-state">Searching...</div>
        )}

        {!loading && safeResults.length === 0 && (
          <div className="results-state">
            {'No benches found nearby.'}
          </div>
        )}

        {!loading &&
          safeResults.map((result) => (
              <BenchCard
                bench={result}
                isSelected={selectedBenchId === result.id}
                key={result.id}
                onClick={() => onSelectBench?.(result)}
              />
          ))}
      </div>

      <div className="results-footer">
        <span className="footer-text">Don’t See Your Bench?</span>
        <button
          type="button"
          className="add-link"
          onClick={onAddBench}
        >
          Add it!
        </button>
      </div>
    </div>
  );
}
