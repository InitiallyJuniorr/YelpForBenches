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
    
    // try {
    // //   const url = `https://nominatim.openstreetmap.org/search?q=/${encodeURIComponent(
    // //     query
    // //   )}&format=json&limit=1&addressdetails=1`

    // //   const response = await fetch(url, {
    // //     headers: {
    // //       'User-Agent': 'YelpForBenches (fakeemail@gmail.com)'
    // //     }
    // //   })
      
    // //   const data = await response.json()

    // //   if (!data.length) throw new Error('No results found')

    // //   const feature = data[0]

    // //   const formattedResults = [{
    // //     id: feature.place_id,
    // //     name: feature.display_name,
    // //     lon: parseFloat(feature.lon),
    // //     lat: parseFloat(feature.lat)
    // //   }]

    // //   setResults(formattedResults)

    // //   setSelectedPlace(null) // reset selected place when new search is made
    // // } catch (error) {
    // //   console.error('Search failed:', error)
    // // } finally {
    // //   setLoading(false)
    // // }
    
    try {
      const organicUrl = `https://nominatim.openstreetmap.org/search?q=/${encodeURIComponent( // To find coords of requested location
        query
      )}&format=json&limit=1&addressdetails=1`

      const organicResponse = await fetch(organicUrl, {
        headers: {
          'User-Agent': 'YelpForBenches (fakeemail@gmail.com)'
        }
      })
      
      const organicData = await organicResponse.json()

      if (!organicData.length) throw new Error('No results found')

      const organicFeature = organicData[0]

      const organicFormattedResults = {
        id: organicFeature.place_id,
        name: organicFeature.display_name,
        lon: parseFloat(organicFeature.lon),
        lat: parseFloat(organicFeature.lat)
      }

      const benchUrl = `http://localhost:8080/bench-lookup?lat=${organicFormattedResults.lat}&lon=${organicFormattedResults.lon}`
      const benchResponse = await fetch(benchUrl)
      const benchData = await benchResponse.json()
      console.log(benchData)
      
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        query
      )}.json?key=${API_KEY}&limit=10&proximity=-118.4448,34.0696`

      const response = await fetch(url)
      const data = await response.json()

      console.log(data)

      const formattedResults = benchData.map((feature) => ({
        id: feature.id,
        name: feature.name,
        address: feature.address,
        lon: feature.lon,
        lat: feature.lat,
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
