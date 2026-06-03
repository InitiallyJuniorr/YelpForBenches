import { useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'
import MapView from './MapView';
import CreateBenchPopup from './CreateBenchPopup';
import BenchDetailsPopup from './BenchDetailsPopup';
import WriteReviewPopup from './WriteReviewPopup';

import exampleBench from './assets/exampleBench.png';
import toby from './assets/toby.png';

const EMPTY_BENCH_DRAFT = { // Template for a new bench being added before it's saved to the backend
  name: '',
  address: '',
  review: '',
  rating: 0,
  imageURL: '',
  lat: null,
  lng: null,
};

const formatDroppedPinAddress = (location) => {
  if (!location) return '';

  return `Dropped pin: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
};

const getAverageRating = (reviews) => {
  if (!reviews.length) return 0;

  const totalRating = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0
  );

  return totalRating / reviews.length;
};

const addReviewToBench = (bench, review) => {
  const reviews = [review, ...(bench.reviews || [])];

  return {
    ...bench,
    reviews,
    avgRating: getAverageRating(reviews),
  };
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
    avgRating: Number(bench.avgRating ?? rating?.avgRating) || 0,
    reviewCount: Number(bench.reviewCount ?? rating?.reviewCount) || 0,
  };
};

export default function MapController() {
  const [benches, setBenches] = useState([]);
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [selectedBench, setSelectedBench] = useState(null);
  const [isCreateBenchOpen, setIsCreateBenchOpen] = useState(false);
  const [isConfirmLocationOpen, setIsConfirmLocationOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [benchDraft, setBenchDraft] = useState(EMPTY_BENCH_DRAFT);
  const [pendingBenchLocation, setPendingBenchLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
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

      setBenches(
        benchData.map((bench) => formatBenchFromBackend(bench, ratingByBenchId))
      );
    } catch (error) {
      console.error('Error fetching benches:', error);
    }
  }, []);

<<<<<<< HEAD
 useEffect(() => {
      if (!email) return;
          const fetchUser = async () => {
          const res = await fetch(`http://localhost:8080/user?email=${email}`);
          const data = await res.json();
          setUserInfo(data);
      };
      fetchUser();
  }, [email]);  

  // TODO_BACKEND: Once backend loading is wired, this selection should use the
  // backend bench id consistently instead of mixing mock ids and database ids.
=======
  useEffect(() => { // On initial load, fetch all benches from the backend
    fetchBenches();
  }, [fetchBenches]);


>>>>>>> 3e84dc56b25591381eebd338bc369e56e502e512
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
    setBenchDraft({ // Start with empty draft but pre-fill lat/lng/address based on where the user center of map is
      ...EMPTY_BENCH_DRAFT,
      lat: location.lat,
      lng: location.lng,
      address: formatDroppedPinAddress(location),
    });
    setIsConfirmLocationOpen(true);
  };

  const handleConfirmBenchLocation = () => { // user confirms location of new bench after dragging the marker to adjust location, which opens the CreateBenchPopup, passing the lat/lng properties
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

<<<<<<< HEAD
  const handleSubmitReview = async ({ rating, preview }) => {
    if (!selectedBench) return;
    // TODO_BACKEND: Replace this optimistic frontend-only review with a POST
    // to /add-review using the logged-in user's id/email from auth state.

    try {
      await fetch('http://localhost:8080/add-review', {
          method: 'POST',
           headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            benchId: selectedBench.id,
            userId: email,
            stars: rating,
            review: preview
            })
        });
    } catch (error) {}
=======
  // When a new review is submitted, add the new review to the bench in the frontend and then post the new review to the backend
  const handleSubmitReview = ({ rating, preview }) => {
    if (!selectedBench) return;

>>>>>>> 3e84dc56b25591381eebd338bc369e56e502e512
    const newReview = {
      id: `review-${Date.now()}`,
      benchId: selectedBenchId,
      userId: userInfo.email,    // Replace user@gmail.com with actual user
      author: 'You',
      badge: 'Complacent Sitter',
      stars: rating,
      avatarUrl: userInfo.pfp_url,
      review: preview,
    };

    try {
      fetch('http://localhost:8080/add-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(newReview)
      })
    } catch (error) {}

    setBenches((prevBenches) =>
      prevBenches.map((bench) =>
        bench.id === selectedBench.id ? addReviewToBench(bench, newReview) : bench
      )
    );

    setSelectedBench((prevBench) => {
      if (!prevBench) return prevBench;
      return addReviewToBench(prevBench, newReview);
    });

    setIsWriteReviewOpen(false);
  };

  const handleCreateBenchSubmit = async (draft) => { // sends POST request to backend to create new bench (and also adds new review to it), then adds the new bench to the map and opens the details popup for the new bench
    if (draft.lat == null || draft.lng == null) {
      alert('Choose a bench location first.');
      return;
    }

    const imageURL = draft.imageURL; 
    const rating = Number(draft.rating) || 0;
    const temporaryBenchId = crypto.randomUUID?.() || `bench-${Date.now()}`;

    const draftReview = {
      id: `review-${Date.now()}`,
      author: 'You',
      badge: 'Bench Scout',
      rating,
      avatarUrl: toby,
      preview: draft.review,
    };

    // create new bench object with temporary id and data from the draft, which will be replaced with the actual bench data returned from the backend (including the real id) after the POST request
    const newBench = {
      id: temporaryBenchId,
      name: draft.name,
      address: draft.address || formatDroppedPinAddress(draft),
      lat: draft.lat,
      lng: draft.lng,
      imageURL: draft.imageURL,
      avgRating: rating,
      reviews: [draftReview],
    };

    let lastBenchId = 0    // Tracks the ID generated by mysql for the new bench

    // post new bench to backend
    try { 
      const response = await fetch('http://localhost:8080/add-bench', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(newBench)
      })
      const data = await response.json()
      lastBenchId = data.insertId
      console.log(lastBenchId)
    } catch (error) {}


    const newReview = {
      benchId: lastBenchId,
      userId: email,
      stars: rating,
      review: draft.review
    }

    // post new review to backend, associated with the newly posted bench
    try { 
      fetch('http://localhost:8080/add-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Inform server you are sending JSON
        },
        body: JSON.stringify(newReview)
      })
    } catch (error) {}

    const savedBench = {
      ...newBench,
      id: lastBenchId,
    };

    setBenches((prev) => [...prev, savedBench]);
    setSelectedBenchId(lastBenchId);
    setSelectedBench(savedBench);
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
        open={!!selectedBench}
        bench={selectedBench}
        onClose={() => setSelectedBench(null)}
        onWriteReview={handleOpenWriteReview}
      />

      <WriteReviewPopup
        open={isWriteReviewOpen}
        bench={selectedBench}
        onClose={handleCloseWriteReview}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
