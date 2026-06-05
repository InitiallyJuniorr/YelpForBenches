import  '../Components/components.css'
import ProfileBanner from '../Components/ProfileComponents.jsx';
import React, { useState, useEffect } from 'react'
import { RecentReviews } from '../Components/ProfileComponents.jsx';
import { useNavigate } from 'react-router-dom';
import { Honorific } from '../Components/Honorific.jsx'
import { NavBar } from '../Components/Navbar.jsx'
import profile from '../assets/profile.svg'
import { jwtDecode } from 'jwt-decode'
import LoginPrompt from '../Components/LoginPrompt.jsx';
import { uploadToCloudinary } from '../utils/cloudinary.js';


export function Profile({isLoggedIn = true})
{
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [showMore, setShowMore] = useState(false);
    const token = localStorage.getItem('token');
    const email = token ? jwtDecode(token).email : null;
    const milestones = [0, 1, 6, 16, 51, 101, 251];

    // Function to retrieve user info based off of their email
    useEffect(() => {
        if (!email) return;
    
        const fetchData = async () => {
            const [userRes, reviewsRes] = await Promise.all([
                fetch(`http://localhost:8080/user?email=${email}`),
                fetch(`http://localhost:8080/reviews?user_id=${email}`)
            ]);
            
            const userData = await userRes.json();
            const reviewsData = await reviewsRes.json();
            setUserInfo(userData);
            setUserReviews(Array.isArray(reviewsData) ? reviewsData : []);
    };
    
    fetchData();
    }, [email]);

    // someReviews is a subset of userReviews, which houses the default amount of recent reviews to be shown to the user
    const someReviews = userReviews
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0,8)

    const visibleReviews = showMore ? userReviews : someReviews;

    // Handles users opening the profile screen when they select 'sign in later'
    if (!token) return <LoginPrompt open={true} onClose={() => navigate('/home')} />;

    // Will display 'Loading...' when the data has not yet been t
    if (!userInfo) return <div>Loading...</div>;


    const handlePfpUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = await uploadToCloudinary(file);
        
        // save to backend
        await fetch('http://localhost:8080/update-pfp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, url })
        });

        // update local state so UI refreshes
        setUserInfo(prev => ({ ...prev, pfp_url: url }));
    }

    // Displays a title based off of the number of benches the user has reviewed
    const honorificData = Honorific(userInfo.num_reviewed);
    
    return(
    <>
    <NavBar/>
    <div style={{paddingTop: '161px'}}/>

    <div style={{display: 'flex', paddingRight: '50px'}}>
        <div style={{paddingLeft: '61px', paddingRight: '50px'}}>
        <ProfileBanner 
            name={userInfo.username} 

            tag={honorificData.tag}
            
            tagClass={honorificData.className}

            photo={userInfo.pfp_url ? userInfo.pfp_url : profile}
            onPhotoUpload={handlePfpUpload}
        />
   
            <div style={{paddingTop: '30px'}}/>
            <h2>Recent Reviews</h2>
            <div style={{paddingTop: '23px'}}/>
            
        {visibleReviews.map((review) => (
            <RecentReviews
                key={review.id}
                name={review.name}
                address={review.address}
                rating={review.stars}
                review={review.review}
                img={review.image_url}
            />
        ))}
        <button className=""onClick={() => setShowMore(!showMore)}>
            {showMore ? 'Show Less' : 'Show More'}
        </button>
        </div>

{/* START: SIDE BAR PANEL THAT DESCRIBES HONORIFIC TAGS*/}

        <div className="ProfileBenchMarks" style={{alignItems: 'flexstart' }}>
            <h1>BenchMarks:</h1>
            <div style={{paddingLeft: '10px', paddingRight: '10px'}}>
            <p style={{fontFamily: 'sans-serif', fontWeight: '500'}}>My Current Number of Reviews: {userInfo.num_reviewed}</p>
            <p style={{fontFamily: 'sans-serif'}}>Unlockable Tags:</p>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
            {milestones.map((num) => {
                    const { tag, className } = Honorific(num);
                    return (
                        <li 
                        key={num} 
                        className={className} 
                        style={{ margin: '10px 0', padding: '8px', borderRadius: '25px', fontSize:'15px' }}
                        >
                            <strong>{tag}</strong> 
                            <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '10px' }}>
                                
                                (Unlocked at {num === 251 ? '251+' : `${num}`} reviews)
                            </span>
                        </li>
                    );
                }
            )
            }
      </ul>
            
        </div>

{/* END: SIDE BAR PANEL */}

        <div style={{paddingBottom: '500px'}}/>
    </div>
    <div style={{paddingBottom: '50px'}}/>
    </>
    )
}
