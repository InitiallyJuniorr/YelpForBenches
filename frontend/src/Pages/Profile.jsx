import  '../Components/components.css'
// default exports dont need curly braces
import ProfileBanner from '../Components/ProfileComponents.jsx';
import React, { useState, useEffect } from 'react'

// non default export functions NEED curly braces
import { RecentReviews } from '../Components/ProfileComponents.jsx';
import { useNavigate } from 'react-router-dom';
import { BenchMarks } from '../Components/ProfileComponents.jsx';
import { Honorific } from './Honorific.jsx'
import { NavBar } from '../Components/Navbar.jsx'
import Login from '../Login.jsx'

// PLACEHOLDER IMG
import Tobi from '../assets/tobi.jpg'
import { jwtDecode } from 'jwt-decode'
import LoginPrompt from '../LoginPrompt.jsx';
import { Navigate } from 'react-router-dom'
import { uploadToCloudinary } from '../utils/cloudinary.js';


export function Profile({isLoggedIn = true})
{
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [showMore, setShowMore] = useState(false);
    const token = localStorage.getItem('token');
    const email = token ? jwtDecode(token).email : null;

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

    const someReviews = userReviews
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0,8)

    const visibleReviews = showMore ? userReviews : someReviews;

    if (!token) return <LoginPrompt open={true} onClose={() => navigate('/home')} />;
    if (!token) console.log("help")

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


    // const honorificData = Honorific(6);
    // const honorificData = Honorific(16);
    // const honorificData = Honorific(51);
    // const honorificData = Honorific(101);
    // const honorificData = Honorific(251);
    const honorificData = Honorific(userInfo.num_reviewed);
    return(
    <>
    <NavBar/>
    {/* must include */}
    <div style={{paddingTop: '161px'}}/>

    <div style={{display: 'flex', paddingRight: '50px'}}>
        <div style={{paddingLeft: '61px', paddingRight: '50px'}}>
        <ProfileBanner 
            name={userInfo.username} 

            tag={honorificData.tag}
            
            tagClass={honorificData.className}

            photo={userInfo.pfp_url ? userInfo.pfp_url : Tobi}
            onPhotoUpload={handlePfpUpload}
        >                </ProfileBanner>
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
        <button onClick={() => setShowMore(!showMore)}>
            {showMore ? 'Show Less' : 'Show More'}
        </button>
        </div>
{/* SIDE BAR PANEL */}

        <div className="ProfileBenchMarks">
            <h1>My BenchMarks</h1>
        </div>

{/* END of SIDE BAR PANEL */}
        <div style={{paddingBottom: '500px'}}/>
    </div>
    <div style={{paddingBottom: '50px'}}/>
    </>
    )
}
