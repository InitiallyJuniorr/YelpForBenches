import { useState } from 'react';
import MapView from './MapView';
import CreateBenchModal from './CreateBenchModal';
import ConfirmBenchLocationModal from './ConfirmBenchLocationModal';
import BenchDetailsModal from './BenchDetailsModal';

import exampleBench from './assets/exampleBench.png';
import toby from './assets/toby.png';
const API_KEY = import.meta.env.VITE_MAPTILER_KEY;

const EMPTY_BENCH_DRAFT = {
  name: '',
  address: '',
  review: '',
  rating: 0,
  imageUrl: '',
  lat: null,
  lng: null,
};

export default function MapPage() {
    const initialBenches = [
    {
        id: 'bench-1',
    name: 'Sage Hill Bench',
    address: '330 De Neve Drive, Los Angeles, CA, 90024',
    lat: 34.0702,
    lng: -118.4501,
    avgRating: 4.0,
    imageUrl: exampleBench,
    reviews: [
      {
        id: 'review-1',
        author: 'Tobias Dürschmid',
        badge: 'Ultimate Bench-Sitter',
        rating: 4.0,
        avatarUrl: toby,
        preview:
          'My golly, what a cool bench! Right next to a suburban house, I never felt so safe. Had to take one star off unfortunately because the HOA kicked me out! Now, how is that fair?',
      },
    ]
    }
  ]

  const [benches, setBenches] = useState(initialBenches);
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [selectedBench, setSelectedBench] = useState(null);

  const [isCreateBenchOpen, setIsCreateBenchOpen] = useState(false);
  const [isConfirmLocationOpen, setIsConfirmLocationOpen] = useState(false);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(true);
  

  const [benchDraft, setBenchDraft] = useState(EMPTY_BENCH_DRAFT);
  const [pendingBenchLocation, setPendingBenchLocation] = useState(null);

  const handleMarkerClick = (benchId) => {
    setSelectedBenchId(benchId);
    const foundBench = benches.find((bench) => bench.id === benchId) || null;
    setSelectedBench(foundBench);
  };

  const handleOpenCreateBench = () => {
    setIsCreateBenchOpen(true);
  };

  const handleCloseCreateBench = () => {
    setIsCreateBenchOpen(false);
  };

  
  const geocodeAddress = async (query) => {
    if (!query?.trim()) return null;

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      query
    )}.json?key=${API_KEY}&limit=1&proximity=-118.4448,34.0696`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  };

  const handleCreateBenchSubmit = async (draft) => {
    const geocodeQuery = `${draft.name || ''} ${draft.address || ''}`.trim();
    const location = await geocodeAddress(geocodeQuery);

    if (!location) {
      alert('Could not find that location yet. Try a more specific address.');
      return;
    }

    setCreateBenchDraft({
      ...draft,
      lat: location.lat,
      lng: location.lng,
    });

    setPendingBenchLocation(location);
    setIsCreateBenchOpen(false);
    setIsConfirmLocationOpen(true);
  };


  const handleConfirmBenchLocation = () => {
    if (!createBenchDraft || !pendingBenchLocation) return;

    const newBench = {
      id: crypto.randomUUID(),
      name: benchDraft.name,
      address: benchDraft.address,
      lat: benchDraft.lat,
      lng: benchDraft.lng,
      avgRating: Number(benchDraft.rating) || 0,
      imageUrl: benchDraft.imageUrl || '',
      review: benchDraft.review,
    };

    setBenches((prev) => [...prev, newBench]);
    setSelectedBenchId(newBench.id);
    setSelectedBench(newBench);

    setIsConfirmLocationOpen(false);
    setPendingBenchLocation(null);
  };

  const handleCloseConfirmLocation = () => {
    setIsConfirmLocationOpen(false);
    setPendingBenchLocation(null);
  };

  return (
    <>
      <MapView
        benches={benches}
        selectedBench={selectedBench}
        onMarkerClick={handleMarkerClick}
        pendingMarkerPosition={pendingBenchLocation}
        onAddBench={() => setIsCreateBenchOpen(true)}
      />

      {/* <CreateBenchModal
        open={isCreateBenchOpen}
        draft={benchDraft}
        setDraft={setBenchDraft}
        onClose={() => setIsCreateBenchOpen(false)}
        onSubmit={handleCreateBenchSubmit}
      /> */}

      {/* <ConfirmBenchLocationModal
        open={isConfirmLocationOpen}
        draft={benchDraft}
        pendingBenchLocation={pendingBenchLocation}
        setPendingBenchLocation={setPendingBenchLocation}
        onClose={handleCloseConfirmLocation}
        onConfirm={handleConfirmBenchLocation}
      /> */}

      <BenchDetailsModal
        open={!!selectedBench}
        bench={selectedBench}
        onClose={() => setSelectedBench(null)}
        onWriteReview={() => {
          setSelectedBench(null);
          setIsCreateBenchOpen(true);
        }}
      />

    </>
  );
}