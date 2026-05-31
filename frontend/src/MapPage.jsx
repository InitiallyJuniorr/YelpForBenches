import { useState } from 'react';
import MapView from './MapView';
import CreateBenchModal from './CreateBenchModal';
import BenchDetailsModal from './BenchDetailsModal';
import WriteReviewModal from './WriteReviewModal';

import exampleBench from './assets/exampleBench.png';
import toby from './assets/toby.png';

const EMPTY_BENCH_DRAFT = {
  name: '',
  address: '',
  review: '',
  rating: 0,
  imageUrl: '',
  lat: null,
  lng: null,
};

const formatDroppedPinAddress = (location) => {
  if (!location) return '';

  return `Dropped pin: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
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
          author: 'Tobias Durschmid',
          badge: 'Ultimate Bench-Sitter',
          rating: 4.0,
          avatarUrl: toby,
          preview:
            'My golly, what a cool bench! Right next to a suburban house, I never felt so safe. Had to take one star off unfortunately because the HOA kicked me out! Now, how is that fair?',
        },
      ],
    },
  ];

  const [benches, setBenches] = useState(initialBenches);
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [selectedBench, setSelectedBench] = useState(null);
  const [isCreateBenchOpen, setIsCreateBenchOpen] = useState(false);
  const [isConfirmLocationOpen, setIsConfirmLocationOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [benchDraft, setBenchDraft] = useState(EMPTY_BENCH_DRAFT);
  const [pendingBenchLocation, setPendingBenchLocation] = useState(null);

  const handleMarkerClick = (benchId) => {
    setSelectedBenchId(benchId);
    const foundBench = benches.find((bench) => bench.id === benchId) || null;
    setSelectedBench(foundBench);
  };

  const handleStartAddBench = (mapCenter) => {
    const location = {
      lat: mapCenter.lat,
      lng: mapCenter.lng,
    };

    setSelectedBench(null);
    setSelectedBenchId(null);
    setPendingBenchLocation(location);
    setBenchDraft({
      ...EMPTY_BENCH_DRAFT,
      lat: location.lat,
      lng: location.lng,
      address: formatDroppedPinAddress(location),
    });
    setIsConfirmLocationOpen(true);
  };

  const handleConfirmBenchLocation = () => {
    if (!pendingBenchLocation) return;

    setBenchDraft((prev) => ({
      ...prev,
      lat: pendingBenchLocation.lat,
      lng: pendingBenchLocation.lng,
      address: formatDroppedPinAddress(pendingBenchLocation),
    }));
    setIsConfirmLocationOpen(false);
    setIsCreateBenchOpen(true);
  };

  const handleCancelAddBench = () => {
    setIsConfirmLocationOpen(false);
    setIsCreateBenchOpen(false);
    setPendingBenchLocation(null);
    setBenchDraft(EMPTY_BENCH_DRAFT);
  };

  const handleCloseCreateBench = () => {
    setIsCreateBenchOpen(false);
    setPendingBenchLocation(null);
    setBenchDraft(EMPTY_BENCH_DRAFT);
  };

  const handleOpenWriteReview = () => {
    setIsWriteReviewOpen(true);
  };

  const handleCloseWriteReview = () => {
    setIsWriteReviewOpen(false);
  };

  const handleSubmitReview = ({ rating, preview }) => {
    if (!selectedBench) return;

    const newReview = {
      id: `review-${Date.now()}`,
      author: 'You',
      badge: 'Bench Scout',
      rating,
      avatarUrl: toby,
      preview,
    };

    // TODO: POST newReview to the backend once review creation endpoints are ready.
    setBenches((prevBenches) =>
      prevBenches.map((bench) => {
        if (bench.id !== selectedBench.id) return bench;

        const reviews = [newReview, ...(bench.reviews || [])];
        const totalRating = reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        );

        return {
          ...bench,
          reviews,
          avgRating: totalRating / reviews.length,
        };
      })
    );

    setSelectedBench((prevBench) => {
      const reviews = [newReview, ...(prevBench.reviews || [])];
      const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      );

      return {
        ...prevBench,
        reviews,
        avgRating: totalRating / reviews.length,
      };
    });

    setIsWriteReviewOpen(false);
  };

  const handleCreateBenchSubmit = async (draft) => {
    if (draft.lat == null || draft.lng == null) {
      alert('Choose a bench location first.');
      return;
    }

    const rating = Number(draft.rating) || 0;
    const newBench = {
      id: crypto.randomUUID?.() || `bench-${Date.now()}`, // NOT USED BY BACKEND
      name: draft.name,
      address: draft.address || formatDroppedPinAddress(draft),
      lat: draft.lat,
      lng: draft.lng,
      imageUrl: draft.imageUrl || exampleBench,
      avgRating: rating,  // NOT USED BY BACKEND
      reviews: [    // NOT USED BY BACKEND
        {
          id: `review-${Date.now()}`,
          author: 'You',
          badge: 'Bench Scout',
          rating,
          avatarUrl: toby,
          preview: draft.review,
        },
      ],
    };

    const lastBenchId = 0;    // Tracks the ID generated by mysql for the new bench

    try {
      lastBenchId = await fetch('http://localhost:8080/add-bench', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(newBench)
      })
    } catch (error) {}

    setBenches((prev) => [...prev, newBench]);
    setSelectedBenchId(lastBenchId);
    setSelectedBench(newBench);
    setIsCreateBenchOpen(false);
    setPendingBenchLocation(null);
    setBenchDraft(EMPTY_BENCH_DRAFT);
  };

  return (
    <>
    
      <MapView
        benches={benches}
        selectedBenchId={selectedBenchId}
        selectedBench={selectedBench}
        onMarkerClick={handleMarkerClick}
        pendingMarkerPosition={pendingBenchLocation}
        confirmLocationMode={isConfirmLocationOpen}
        onAddBench={handleStartAddBench}
        onPendingMarkerMove={setPendingBenchLocation}
        onConfirmBenchLocation={handleConfirmBenchLocation}
        onCancelAddBench={handleCancelAddBench}
      />
      
      <CreateBenchModal
        open={isCreateBenchOpen}
        draft={benchDraft}
        setDraft={setBenchDraft}
        onClose={handleCloseCreateBench}
        onSubmit={handleCreateBenchSubmit}
      />

      <BenchDetailsModal
        open={!!selectedBench}
        bench={selectedBench}
        onClose={() => setSelectedBench(null)}
        onWriteReview={handleOpenWriteReview}
      />

      <WriteReviewModal
        open={isWriteReviewOpen}
        bench={selectedBench}
        onClose={handleCloseWriteReview}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
