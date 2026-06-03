import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'
import MapView from './MapView';
import CreateBenchPopup from './CreateBenchPopup';
import BenchDetailsPopup from './BenchDetailsPopup';
import WriteReviewPopup from './WriteReviewPopup';

import exampleBench from './assets/exampleBench.png';
import toby from './assets/toby.png';

const EMPTY_BENCH_DRAFT = {
  name: '',
  address: '',
  review: '',
  rating: 0,
  imageURL: '',
  lat: null,
  lng: null,
};

// TODO_BACKEND: Replace this frontend seed data with GET /bench plus review data
// from the backend once the bench/review read endpoints return the full shape.
const MOCK_BENCHES = [
  {
    id: 'bench-1',
    name: 'Sage Hill Bench',
    address: '330 De Neve Drive, Los Angeles, CA, 90024',
    lat: 34.0702,
    lng: -118.4501,
    avgRating: 4.0,
    imageURL: exampleBench,
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

  useEffect(() => {
    const fetchBenches = async () => {
      try {
        const response = await fetch('http://localhost:8080/bench');

        if (!response.ok) {
          throw new Error(`Error fetching benches: ${response.status}`);
        }

        const data = await response.json();

        const formatted = data.map((bench) => ({
          id: bench.id,
          name: bench.name,
          address: bench.address,
          imageURL: bench.image_url,
          lat: bench.coordinates.y,
          lng: bench.coordinates.x,
        }));

        setBenches(formatted);
      } catch (error) {
        console.error('Error fetching benches:', error);
      }
    };

    fetchBenches();
  }, []);

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
    const newReview = {
      id: `review-${Date.now()}`,
      benchId: selectedBenchId,
      userId: userInfo.email,    // Replace user@gmail.com with actual user
      author: 'You',
      badge: 'Bench Scout',
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

  const handleCreateBenchSubmit = async (draft) => {
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

    // TODO_BACKEND: imageURL, avgRating, and reviews are frontend placeholders.
    // Backend bench rows currently store name/address/coordinates separately
    // from reviews and photos.
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

    // TODO_BACKEND: Replace user@gmail.com with the authenticated user's id.
    const newReview = {
      benchId: lastBenchId,
      userId: email,
      stars: rating,
      review: draft.review
    }

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
