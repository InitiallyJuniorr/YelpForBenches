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

// When a bench is selected from the results panel, fly to it on the map and open its popup
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

// Tracks the map center and reports changes to the parent component so that we can do things like search for nearby benches
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

// Allows user to confirm the dropped pin location by dragging a marker for add new bench flow
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

// Utility function to calculate distance in miles between two lat/lng points using the Haversine formula
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
  onBenchesChange,
  onResetBenches,
  onPendingMarkerMove,
  onConfirmBenchLocation,
  onCancelAddBench,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  });

  // Filter benches to those within a certain radius of the map center and that match the search query, and sort by distance
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

  // When the user performs a search, call the backend with the query and map center to get nearby benches matching the query
  const handleSearch = async () => {
    
      try {
      setLoading(true);

      const params = new URLSearchParams({
        q: query,              
        lat: mapCenter.lat,
        lng: mapCenter.lng
      });

      const res = await fetch(`http://localhost:8080/bench-search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch benches');

      const data = await res.json();
      onBenchesChange?.(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setQuery("");

    if (!onResetBenches) return;

    try {
      setLoading(true);
      await onResetBenches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // when new bench first added, it is placed in the center of map and allows dragging to adjust location before confirming
  const handleAddBench = () => {
    onAddBench?.(mapCenter);
  };

  const handleSelectBench = (bench) => {
    onMarkerClick?.(bench.id);
  };

  // to be passed to component ResultsPanel
  const panelResults = nearbyBenchResults;

  return (
    <div
      className={`map-view ${confirmLocationMode ? "confirm-mode" : ""}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    >
      {!confirmLocationMode && ( // conditional so that panel doesn't show in "confirm new bench location" mode
        <ResultsPanel
          query={query}
          setQuery={setQuery}
          results={panelResults}
          selectedBenchId={selectedBenchId}
          onSearch={handleSearch}
          onClear={clearSearch}
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

            <Marker position={DEFAULT_CENTER} icon={defaultMarkerIcon}>
              <Popup>UCLA</Popup>
            </Marker>

            {panelResults.map((bench) => (
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
