// MapView.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ResultsPanel from "./ResultsPanel";
import "./MapView.css";

const API_KEY = import.meta.env.VITE_MAPTILER_KEY;
const DEFAULT_CENTER = [34.0689, -118.4452]; // Westwood / UCLA-ish
const DEFAULT_ZOOM = 16;
const NEARBY_BENCH_RADIUS_MILES = 5;

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
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
    if (selectedBench?.lat == null || selectedBench?.lng == null) return;

    map.flyTo([selectedBench.lat, selectedBench.lng], 16, {
      duration: 1.1,
    });
  }, [selectedBench, map]);

  return null;
}

function MapCenterTracker({ onCenterChange }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    },
    zoomend() {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    },
  });

  useEffect(() => {
    const center = map.getCenter();
    onCenterChange({ lat: center.lat, lng: center.lng });
  }, [map, onCenterChange]);

  return null;
}

function DraggablePendingMarker({ position, onChange }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;

        const next = marker.getLatLng();
        onChange({ lat: next.lat, lng: next.lng });
      },
    }),
    [onChange]
  );

  if (!position) return null;

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      icon={highlightedMarkerIcon}
      position={[position.lat, position.lng]}
      ref={markerRef}
    />
  );
}

function getDistanceInMiles(first, second) {
  const earthRadiusMiles = 3958.8;
  const latDistance = ((second.lat - first.lat) * Math.PI) / 180;
  const lngDistance = ((second.lng - first.lng) * Math.PI) / 180;
  const firstLat = (first.lat * Math.PI) / 180;
  const secondLat = (second.lat * Math.PI) / 180;

  const haversine =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function MapView({
  benches = [],
  selectedBenchId = null,
  selectedBench = null,
  pendingMarkerPosition = null,
  confirmLocationMode = false,
  onMarkerClick,
  onAddBench,
  onPendingMarkerMove,
  onConfirmBenchLocation,
  onCancelAddBench,
}) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("location");
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  });

  const nearbyBenchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return benches
      .map((bench) => ({
        ...bench,
        distanceMiles: getDistanceInMiles(mapCenter, bench),
      }))
      .filter((bench) => bench.distanceMiles <= NEARBY_BENCH_RADIUS_MILES)
      .filter((bench) => {
        if (!normalizedQuery) return true;

        return [
          bench.name,
          bench.address,
          `${bench.lat}`,
          `${bench.lng}`,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((first, second) => first.distanceMiles - second.distanceMiles);
  }, [benches, mapCenter, query]);

  const handleSearch = async () => {
    if (searchMode === "bench") return;
    if (!query.trim()) return;

    setLoading(true);

    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        query
      )}.json?key=${API_KEY}&limit=10&proximity=-118.4448,34.0696`;

      const response = await fetch(url);
      const data = await response.json();

      const formattedResults = data.features.map((feature) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        lon: feature.center[0],
        lat: feature.center[1],
      }));

      setResults(formattedResults);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSelectedPlace(null);
  };

  const handleSearchModeChange = (nextMode) => {
    setSearchMode(nextMode);
    setSelectedPlace(null);
  };

  const handleAddBench = () => {
    onAddBench?.(mapCenter);
  };

  const handleSelectBench = (bench) => {
    onMarkerClick?.(bench.id);
  };

  const visibleBenches = searchMode === "bench" ? nearbyBenchResults : benches;
  const panelResults = searchMode === "bench" ? nearbyBenchResults : results;

  return (
    <div
      className={`map-view ${confirmLocationMode ? "confirm-mode" : ""}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    >
      {!confirmLocationMode && (
        <ResultsPanel
          query={query}
          setQuery={setQuery}
          results={panelResults}
          selectedPlace={selectedPlace}
          selectedBenchId={selectedBenchId}
          searchMode={searchMode}
          onSearchModeChange={handleSearchModeChange}
          onSearch={handleSearch}
          onClear={clearSearch}
          onSelectPlace={setSelectedPlace}
          onSelectBench={handleSelectBench}
          loading={loading}
          onAddBench={handleAddBench}
        />
      )}

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

        <MapCenterTracker onCenterChange={setMapCenter} />

        {!confirmLocationMode && (
          <>
            <FlyToSelectedBench selectedBench={selectedBench} />
            <FlyToSelectedPlace selectedPlace={selectedPlace} />

            <Marker position={DEFAULT_CENTER} icon={defaultMarkerIcon}>
              <Popup>UCLA</Popup>
            </Marker>

            {visibleBenches.map((bench) => (
              <Marker
                key={bench.id}
                icon={
                  selectedBenchId === bench.id
                    ? highlightedMarkerIcon
                    : defaultMarkerIcon
                }
                position={[bench.lat, bench.lng]}
                eventHandlers={{
                  click: () => onMarkerClick?.(bench.id),
                }}
              />
            ))}
          </>
        )}

        {confirmLocationMode && (
          <DraggablePendingMarker
            position={pendingMarkerPosition}
            onChange={onPendingMarkerMove}
          />
        )}
      </MapContainer>

      {confirmLocationMode && (
        <>
          <button
            type="button"
            className="confirm-location-cancel"
            onClick={onCancelAddBench}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-location-submit"
            onClick={onConfirmBenchLocation}
          >
            Confirm Bench Location
          </button>
        </>
      )}
    </div>
  );
}
