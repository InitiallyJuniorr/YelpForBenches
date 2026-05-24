import './ResultsPanel.css';
import { useEffect, useState } from 'react';

function BenchCard({ title, address, rating, count, imageUrl }) {
  return (
    <>
    <div style={{paddingTop: '160px'}}/>
    <div className="bench-card">
      <div className="bench-card-info">
        <h3 className="bench-card-title">{title}</h3>
        <p className="bench-card-address">{address}</p>
        <div className="bench-card-rating">
          <div className="bench-card-stars">
            {/* replace squares with actual stars later */}
            <span className="bench-card-star" />
            <span className="bench-card-star" />
            <span className="bench-card-star" />
            <span className="bench-card-star" />
          </div>
          <span className="bench-card-rating-text">
            {rating} ({count})
          </span>
        </div>
      </div>
      <img
        className="bench-card-image"
        src={imageUrl}
        alt={title}
      />
    </div>
    </>
  );
}

// export default function ResultsPanel() {
//     const benches = [
//     {
//       id: 1,
//       title: 'Cool Bench',
//       address: '330 De Neve Drive, Los Angeles CA, 90024',
//       rating: '4.9',
//       count: 206,
//       imageUrl: 'https://placehold.co/269x202',
//     },
//     // more benches...
//   ];

export default function ResultsPanel({
  query,
  setQuery,
  results,
  selectedPlace,
  onSearch,
  onClear,
  onSelectPlace,
  loading,
}) {
  return (
    <div className="results-panel">
        <div className="search-box">
          <span className="search-icon" />
          <input
            className="search-input"
            type="text"
            value={query}
            placeholder="Cool Bench"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />
          <button className="icon-btn" onClick={onSearch}>🔍︎</button>
          <button className="clear-button" onClick={onClear}>
            X
          </button>
        </div>

    <div className="results-header">
        <h2 className="results-title">Top Results</h2>
        <button className="filter-button">
          <span className="filter-icon" />
          <span className="filter-label">Filter</span>
        </button>
    </div>
      

      <div className="results-list">
        {results.map((place) => (
            <button
              key={place.id}
              type="button"
              className={`bench-card result-button ${
                selectedPlace?.id === place.id ? 'selected' : ''
              }`}
              onClick={() => onSelectPlace(place)}
            >
              <div className="bench-card-info">
                <h3 className="bench-card-title">{place.name}</h3>
                <p className="bench-card-address">{place.address}</p>

                <div className="bench-card-rating">
                  <div className="bench-card-stars">
                    <span className="bench-card-star" />
                    <span className="bench-card-star" />
                    <span className="bench-card-star" />
                    <span className="bench-card-star" />
                  </div>
                  <span className="bench-card-rating-text">
                    Search result
                  </span>
                </div>
              </div>

              <div className="result-image-wrap">
                <img
                  className="bench-card-image"
                  src="https://s3.dutchcrafters.com/product-images/600-600/pid_45637-Amish-Cedar-Wood-Traditional-English-Garden-Bench--270.jpg"
                  alt={place.name}
                />
              </div>
            </button>
          ))}
      </div>

      <div className="results-footer">
        <span className="footer-text">Don’t See Your Bench?</span>
        <button className="add-link">Add it!</button>
      </div>
    </div>
  );
}