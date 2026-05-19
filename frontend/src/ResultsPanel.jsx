import './ResultsPanel.css';

function BenchCard({ title, address, rating, count, imageUrl, onClick, isSelected }) {
  return (
    <button
      type="button"
      className={`bench-card result-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="bench-card-info">
        <h3 className="bench-card-title">{title}</h3>
        <p className="bench-card-address">{address}</p>

        <div className="bench-card-rating">
          <div className="bench-card-stars">
            <span className="bench-card-star" />
            <span className="bench-card-star" />
            <span className="bench-card-star" />
            <span className="bench-card-star" />
          </div>
          <span className="bench-card-rating-text">
            {rating} {count ? `(${count})` : ''}
          </span>
        </div>
      </div>

      <div className="result-image-wrap">
        <img
          className="bench-card-image"
          src={imageUrl}
          alt={title}
        />
      </div>
    </button>
  );
}

export default function ResultsPanel({
  query,
  setQuery,
  results = [],
  selectedPlace = null,
  onSearch,
  onClear,
  onSelectPlace,
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
          placeholder="Cool Bench"
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
          🔍︎
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
        <h2 className="results-title">Top Results</h2>

        <button type="button" className="filter-button">
          <span className="filter-icon" />
          <span className="filter-label">Filter</span>
        </button>
      </div>

      <div className="results-list">
        {loading && (
          <div className="results-state">Searching...</div>
        )}

        {!loading && safeResults.length === 0 && (
          <div className="results-state">
            No results yet.
          </div>
        )}

        {!loading &&
          safeResults.map((place) => (
            <BenchCard
              key={place.id}
              title={place.name || place.title || 'Untitled Bench'}
              address={place.address || place.fullName || 'No address provided'}
              rating={place.rating || '4.9'}
              count={place.count || ''}
              imageUrl={
                place.imageUrl ||
                'https://s3.dutchcrafters.com/product-images/600-600/pid_45637-Amish-Cedar-Wood-Traditional-English-Garden-Bench--270.jpg'
              }
              isSelected={selectedPlace?.id === place.id}
              onClick={() => onSelectPlace(place)}
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