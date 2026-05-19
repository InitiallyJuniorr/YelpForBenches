// MapView.jsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ResultsPanel from "./ResultsPanel";

const API_KEY = import.meta.env.VITE_MAPTILER_KEY;
const DEFAULT_CENTER = [34.0689, -118.4452]; // Westwood / UCLA-ish
const DEFAULT_ZOOM = 16;
const maxZoom = 22;

const defaultMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightedMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FlyToSelectedPlace({ selectedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace?.lat == null || selectedPlace?.lon == null) return;

    map.flyTo([selectedPlace.lat, selectedPlace.lon], 16, {
      duration: 1.1,
    });
  }, [selectedPlace, map]);

  return null;
}

function FlyToSelectedBench({ selectedBench }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedBench?.lat || !selectedBench?.lon) return;
    map.flyTo([selectedBench.lat, selectedBench.lon], 16, {
      duration: 1.1,
    });
  }, [selectedBench, map]);

  return null;
}

function FlyToPendingMarker({ pendingMarkerPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!pendingMarkerPosition?.lat || !pendingMarkerPosition?.lon) return;
    map.flyTo([pendingMarkerPosition.lat, pendingMarkerPosition.lon], 16, {
      duration: 1.1,
    });
  }, [pendingMarkerPosition, map]);

  return null;
}

export default function MapView({
  benches = [],
  selectedBenchId = null,
  selectedBench = null,
  pendingMarkerPosition = null,
  onMarkerClick,
  onAddBench,
}) {

    const [query, setQuery] = useState('Cool bench') // what the user types in the search bar
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
    <div
      className="map-view"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    >
    <ResultsPanel
        query={query}
        setQuery={setQuery}
        results={results}
        selectedPlace={selectedPlace}
        onSearch={handleSearch}
        onClear={clearSearch}
        onSelectPlace={setSelectedPlace}
        loading={loading}
        onAddBench={onAddBench}
    />
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FlyToSelectedBench selectedBench={selectedBench} />
        <FlyToPendingMarker pendingMarkerPosition={pendingMarkerPosition} />
        <FlyToSelectedPlace selectedPlace={selectedPlace} />

        <Marker position={DEFAULT_CENTER}>
            <Popup>UCLA</Popup>
        </Marker>

        {benches.map((bench) => (
          <Marker
            key={bench.id}
            position={[bench.lat, bench.lng]}
            eventHandlers={{
              click: () => {
                console.log('clicked marker:', bench);
                onMarkerClick?.(bench.id);
            },
            }}
          />
        ))}

        {pendingMarkerPosition?.lat && pendingMarkerPosition?.lng && (
          <Marker
            position={[pendingMarkerPosition.lat, pendingMarkerPosition.lng]}
            icon={highlightedMarkerIcon}
          >
            <Popup>
              New bench location preview
            </Popup>
          </Marker>
          
        )}
      </MapContainer>
    </div>
  );
}