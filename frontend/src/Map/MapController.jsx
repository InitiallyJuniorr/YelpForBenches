import { useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'
import LoginPrompt from '../Components/LoginPrompt.jsx';
import MapView from './MapView';
import CreateBenchPopup from './CreateBenchPopup';
import BenchDetailsPopup from './BenchDetailsPopup';
import WriteReviewPopup from './WriteReviewPopup';

const EMPTY_BENCH_DRAFT = { // Template for a new bench being added before it's saved to the backend
  name: '',
  address: '',
  imageURL: '',
  lat: null,
  lng: null,
  review: '',
  rating: 0,
};

const formatDroppedPinAddress = (location) => {
  if (!location) return '';

  return `Dropped pin: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
};

// Transforms the bench data from the backend into the format expected by the frontend, and also merges in rating data from the /bench-ratings
const formatBenchFromBackend = (bench, ratingByBenchId = new Map()) => {
  const rating = ratingByBenchId.get(Number(bench.id));

  return {
    id: bench.id,
    name: bench.name,
    address: bench.address,
    imageURL: bench.imageURL || bench.image_url,
    lat: bench.lat ?? bench.coordinates?.y,
    lng: bench.lng ?? bench.coordinates?.x,
    avgRating: Number(rating?.avgRating ?? bench.avgRating) || 0,
    reviewCount: Number(rating?.reviewCount ?? bench.reviewCount) || 0,
  };
};

const applySubmittedRatingToBench = (bench, submittedRating, previousReviewCount) => {
  const currentReviewCount = Number(bench.reviewCount) || 0;

  if (currentReviewCount > previousReviewCount) {
    return bench;
  }

  const nextReviewCount = previousReviewCount + 1;
  const nextAvgRating =
    ((Number(bench.avgRating) || 0) * previousReviewCount + Number(submittedRating)) /
    nextReviewCount;

  return {
    ...bench,
    avgRating: nextAvgRating,
    reviewCount: nextReviewCount,
  };
};

const applySubmittedRatingToBenches = (
  benches,
  benchId,
  submittedRating,
  previousReviewCount
) =>
  benches.map((bench) =>
    Number(bench.id) === Number(benchId)
      ? applySubmittedRatingToBench(bench, submittedRating, previousReviewCount)
      : bench
  );

export default function MapController() {
  const [benches, setBenches] = useState([]); 
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [selectedBench, setSelectedBench] = useState(null);

  const [isCreateBenchOpen, setIsCreateBenchOpen] = useState(false);
  const [isBenchDetailsOpen, setIsBenchDetailsOpen] = useState(false);
  const [isConfirmLocationOpen, setIsConfirmLocationOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const [benchDraft, setBenchDraft] = useState(EMPTY_BENCH_DRAFT);
  const [pendingBenchLocation, setPendingBenchLocation] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const token = localStorage.getItem('token');
  const email = token ? jwtDecode(token).email : null;

  const fetchBenches = useCallback(async () => {
    try {
      const benchesResponse = await fetch('http://localhost:8080/bench');

      if (!benchesResponse.ok) {
        throw new Error(`Error fetching benches: ${benchesResponse.status}`);
      }

      const benchData = await benchesResponse.json();
      
      let ratingByBenchId = new Map();

      try {
        const ratingsResponse = await fetch('http://localhost:8080/bench-ratings');

        if (ratingsResponse.ok) {
          const ratingData = await ratingsResponse.json();
          ratingByBenchId = new Map(
            ratingData.map((rating) => [Number(rating.benchId), rating])
          );
        }
      } catch (error) {
        console.error('Error fetching bench ratings:', error);
      }

      const formattedBenches = benchData.map((bench) =>
        formatBenchFromBackend(bench, ratingByBenchId)
      );

      setBenches(formattedBenches);
      return formattedBenches;
    } catch (error) {
      console.error('Error fetching benches:', error);
      return [];
    }
  }, []);

  
  useEffect(() => {
    fetchBenches();
  }, [fetchBenches]);

  
  const handleMarkerClick = (benchId) => {
    setSelectedBenchId(benchId);
    // .find to search through the benches array for the bench with the matching id, and sets selectedBench to that bench object (or null if not found)
    const foundBench = benches.find((bench) => bench.id === benchId) || null; 
    setSelectedBench(foundBench); 
    setIsBenchDetailsOpen(Boolean(foundBench));
  };

  const handleStartAddBench = (mapCenter) => {
    if (!email) { setShowLoginPrompt(true); return; }
    const location = {
      lat: mapCenter.lat,
      lng: mapCenter.lng,
    };

    // reset any existing bench selection or draft data, and open the confirm location with the marker placed at the center of the map
    setSelectedBench(null);
    setSelectedBenchId(null);
    setIsBenchDetailsOpen(false);
    setPendingBenchLocation(location);
    setBenchDraft({ // empty draft but pre-fill with lat/lng/address
      ...EMPTY_BENCH_DRAFT,
      lat: location.lat,
      lng: location.lng,
      address: formatDroppedPinAddress(location),
    });
    setIsConfirmLocationOpen(true);
  };

  // user confirms location of new bench after dragging the marker to adjust location
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
      if (!email) { setShowLoginPrompt(true); return; }
      setIsWriteReviewOpen(true);
      setIsBenchDetailsOpen(false);
  };

  const handleCloseWriteReview = () => {
    setIsWriteReviewOpen(false);
  };

  const handleSubmitReview = async ({ rating, reviewText }) => {
    if (!selectedBench) return;
    const previousReviewCount = Number(selectedBench.reviewCount) || 0;

    try { 
      await fetch('http://localhost:8080/add-review', {
          method: 'POST',
           headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            benchId: selectedBench.id,
            userId: email,
            stars: rating,
            review: reviewText,
            })
      });

      // fetch updated bench data from backend
      const refreshedBenches = await fetchBenches();
      const updatedBenches = applySubmittedRatingToBenches(
        refreshedBenches,
        selectedBench.id,
        rating,
        previousReviewCount
      );
      const updatedBench = refreshedBenches.find(
        (bench) => Number(bench.id) === Number(selectedBench.id)
      );

      setBenches(updatedBenches);

      if (updatedBench) {
        setSelectedBench(
          applySubmittedRatingToBench(updatedBench, rating, previousReviewCount)
        );
      }

      setIsWriteReviewOpen(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  // sends POST request to backend to create new bench (and also adds new review to it)
  const handleCreateBenchSubmit = async (draft) => { 
    if (!email) {
      setShowLoginPrompt(true);
      return;
    }

    if (draft.lat == null || draft.lng == null) {
      alert('Choose a bench location first.');
      return;
    }

    // Keep bench data separate from the required initial review.
    const newBench = {
      name: draft.name,
      address: draft.address || formatDroppedPinAddress(draft),
      imageURL: draft.imageURL,
      lat: draft.lat,
      lng: draft.lng
    };

    let lastBenchId = 0    // Tracks the ID generated by mysql for the new bench

    try { 
      const response = await fetch('http://localhost:8080/add-bench', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(newBench)
      })
      const data = await response.json()
      lastBenchId = data.insertId || data.id
    } catch (error) {
      console.error('Error creating bench:', error);
      return;
    }

    if (!lastBenchId) return;

    setIsCreateBenchOpen(false);
    setPendingBenchLocation(null);
    setBenchDraft(EMPTY_BENCH_DRAFT);

    const initialReview = { // create the initial review for new bench
      benchId: lastBenchId,
      userId: email,
      stars: Number(draft.rating) || 0,
      review: draft.review
    }

    // post new review to backend, associated with the newly posted bench
    try { 
      await fetch('http://localhost:8080/add-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(initialReview)
      })
    } catch (error) {
      console.error('Error creating initial review:', error);
    }

    // fetch the updated list of benches from the backend
    const refreshedBenches = await fetchBenches();
    const updatedBenches = applySubmittedRatingToBenches(
      refreshedBenches,
      lastBenchId,
      initialReview.stars,
      0
    );
    const savedBenchFromBackend = updatedBenches.find(
      (bench) => Number(bench.id) === Number(lastBenchId)
    );

    const savedBench =
      savedBenchFromBackend ||
      {
        ...newBench,
        id: lastBenchId,
        avgRating: initialReview.stars,
        reviewCount: 1,
      };
    const nextBenches = savedBenchFromBackend ? updatedBenches : [...updatedBenches, savedBench];

    // Update state with the new bench and select it + show details
    setBenches(nextBenches);
    setSelectedBenchId(lastBenchId);
    setSelectedBench(savedBench);
    setIsBenchDetailsOpen(true);
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
        onBenchesChange={setBenches}
        onResetBenches={fetchBenches}
        onPendingMarkerMove={setPendingBenchLocation}
        onConfirmBenchLocation={handleConfirmBenchLocation}
        onCancelAddBench={handleCancelAddBench}
      />

      <CreateBenchPopup
        open={isCreateBenchOpen}
        draft={benchDraft}
        setDraft={setBenchDraft}
        onClose={handleCloseCreateBench}
        onSubmit={handleCreateBenchSubmit}
      />

      <BenchDetailsPopup
        open={isBenchDetailsOpen && !!selectedBench}
        bench={selectedBench}
        onClose={() => {
          setIsBenchDetailsOpen(false);
          setSelectedBench(null);
        }}
        onWriteReview={handleOpenWriteReview}
      />

      <WriteReviewPopup
        open={isWriteReviewOpen}
        bench={selectedBench}
        onClose={handleCloseWriteReview}
        onSubmit={handleSubmitReview}
      />
      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
}
