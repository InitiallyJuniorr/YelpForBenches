import './ResultsPanel.css';

function StarRating({ rating = 0 }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <div className="bench-card-stars" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={`bench-card-star ${star <= roundedRating ? 'filled' : ''}`}
          key={star}
        >
          *
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
  const hasImage = Boolean(bench.imageUrl);
  const coordinateText = `${bench.lat.toFixed(5)}, ${bench.lng.toFixed(5)}`;

  return (
    <>
    <div style={{paddingTop: '160px'}}/>
    <div className="bench-card">
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
            src={bench.imageUrl}
            alt={bench.name}
          />
        ) : (
          <div className="bench-card-no-image">No image</div>
        )}
      </div>
      </div>
    </>
  );
}

export default function ResultsPanel({
  query,
  setQuery,
  results = [],
  selectedPlace = null,
  selectedBenchId = null,
  searchMode = 'location',
  onSearchModeChange,
  onSearch,
  onClear,
  onSelectPlace,
  onSelectBench,
  loading = false,
  onAddBench,
}) {
  const safeResults = Array.isArray(results) ? results : [];
  const safeQuery = query ?? '';
  const isBenchMode = searchMode === 'bench';

  return (
    <div className="results-panel">
      <div className="search-mode-toggle" aria-label="Search mode">
        <button
          type="button"
          className={!isBenchMode ? 'active' : ''}
          onClick={() => onSearchModeChange?.('location')}
        >
          Location
        </button>
        <button
          type="button"
          className={isBenchMode ? 'active' : ''}
          onClick={() => onSearchModeChange?.('bench')}
        >
          Bench
        </button>
      </div>

      <div className="search-box">
        <span className="search-icon" />
        <input
          className="search-input"
          type="text"
          value={safeQuery}
          placeholder={isBenchMode ? 'Search benches' : 'Search locations'}
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
          {isBenchMode ? 'Nearby Benches' : 'Top Locations'}
        </h2>
      </div>

      <div className="results-list">
        {loading && (
          <div className="results-state">Searching...</div>
        )}

        {!loading && safeResults.length === 0 && (
          <div className="results-state">
            {isBenchMode
              ? 'No benches found nearby.'
              : 'No location results yet.'}
          </div>
        )}

        {!loading &&
          safeResults.map((result) => (
            isBenchMode ? (
              <BenchCard
                bench={result}
                isSelected={selectedBenchId === result.id}
                key={result.id}
                onClick={() => onSelectBench?.(result)}
              />
            ) : (
              <LocationCard
                address={result.address || result.fullName || 'No address provided'}
                isSelected={selectedPlace?.id === result.id}
                key={result.id}
                onClick={() => onSelectPlace?.(result)}
                title={result.name || result.title || 'Untitled Location'}
              />
            )
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
