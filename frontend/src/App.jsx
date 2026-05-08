import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import ResultsPanel from './ResultsPanel'


const defaultCenter = [34.0696, -118.4448] // UCLA area
const API_KEY = import.meta.env.VITE_MAPTILER_KEY

function FixMap() {
  const map = useMap()

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }, [map])

  return null
}

function FlyToLocation({ selectedPlace }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedPlace) return

    map.flyTo([selectedPlace.lat, selectedPlace.lon], 16, {
      duration: 1.2,
    })
  }, [selectedPlace, map])

  return null
}

function App() {
  const [query, setQuery] = useState('Cool bench') // what the user types in the search bar
  const [count, setCount] = useState(0) 
  const [results, setResults] = useState([]) // the array of places from MapTiler API
  const [selectedPlace, setSelectedPlace] = useState(null) // the one place the user clicks on from the search results
  const [loading, setLoading] = useState(false) // whether we're waiting for the API to respond

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)

    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        query
      )}.json?key=${API_KEY}&limit=10&proximity=-118.4448,34.0696`

      const response = await fetch(url)
      const data = await response.json()

      const formattedResults = data.features.map((feature) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        lon: feature.center[0],
        lat: feature.center[1],
      }))

      setResults(formattedResults)

      setSelectedPlace(null) // reset selected place when new search is made
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSelectedPlace(null)
  }


  return (
    <>
      <section id="center">
        <div className="page" style={{ display: 'block', width: '100%', height: '500px' }}>
          <aside className="search-panel">
            <ResultsPanel
              query={query}
              setQuery={setQuery}
              results={results}
              selectedPlace={selectedPlace}
              onSearch={handleSearch}
              onClear={clearSearch}
              onSelectPlace={setSelectedPlace}
              loading={loading}
            />
             {/* <div className="search-row">
              <input
                type="text"
                value={query}
                placeholder="Cool Bench"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
              <button className="icon-btn" onClick={handleSearch}>
                🔍︎
              </button>
              <button className="icon-btn" onClick={clearSearch}>
                ✕
              </button>
            </div> */}

            {/* <div className="results-list">
              {results.map((place) => (
                <button
              key={place.id}
              className={`result-card ${
                selectedPlace?.id === place.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="result-info">
                <h3>{place.name}</h3>
                <p>{place.address}</p>
              </div>

              <img
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80"
                alt="Bench"
              />
            </button>
              ))}
            </div> */}
          </aside>
          <div id="map-wrapper">
            <MapContainer
              center={defaultCenter}
              zoom={17}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FixMap />
              <FlyToLocation selectedPlace={selectedPlace} />
              <Marker position={defaultCenter}>
                <Popup>UCLA</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
