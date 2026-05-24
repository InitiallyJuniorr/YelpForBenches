import  '../Components/components.css'
// default exports dont need curly braces
import ProfileBanner from '../Components/ProfileComponents.jsx';

// non default export functions NEED curly braces
import { RecentReviews } from '../Components/ProfileComponents.jsx';
import { BenchMarks } from '../Components/ProfileComponents.jsx';
import { NavBar } from '../Components/Navbar.jsx'
import Login from '../Login.jsx'

// PLACEHOLDER IMG
import Tobi from '../assets/tobi.jpg'


export function Profile({isLoggedIn = true})
{
    if(!isLoggedIn)
    {
        return (
            <>
            <NavBar/>
            <div style={{paddingTop: '161px'}}/>
            <h1>Please Log In To View Profile</h1>
            <Login/>

            </>
        )
    }
    else{
    return(
    <>
    <NavBar/>
    {/* must include */}
    <div style={{paddingTop: '161px'}}/>

    <div style={{display: 'flex'}}>
        <div style={{paddingLeft: '61px', paddingRight: '100px'}}>
                <ProfileBanner name="Tobias Düerschmid" tag="Ultimate Bench Sitter" photo={Tobi}>
                    
                </ProfileBanner>
                <div style={{paddingTop: '30px'}}/>
                <h2>Recent Reviews</h2>
                <div style={{paddingTop: '23px'}}/>
                <RecentReviews name="Cool Bench" address="330 De Neve Drive, Los Angeles CA, 90024" rating="4.0" review="My golly, what a cool bench! Right next to a suburban house, I never felt so safe. Had to take one star off unfortunately because the HOA kicked me out! Now, how is that fair? The birds get to sit on the bench but I can’t? HOA, listen up! You’re ruining this Bench’s potential t"/>
                <RecentReviews name="Cool Bench" address="330 De Neve Drive, Los Angeles CA, 90024" review="My golly, what a cool bench! Right next to a suburban house, I never felt so safe. Had to take one star off unfortunately because the HOA kicked me out! Now, how is that fair? The birds get to sit on the bench but I can’t? HOA, listen up! You’re ruining this Bench’s potential t"/>
                <RecentReviews name="Cool Bench" address="330 De Neve Drive, Los Angeles CA, 90024" review="My golly, what a cool bench! Right next to a suburban house, I never felt so safe. Had to take one star off unfortunately because the HOA kicked me out! Now, how is that fair? The birds get to sit on the bench but I can’t? HOA, listen up! You’re ruining this Bench’s potential t"/>
                <RecentReviews/>
                <h2>Recent Activities</h2>
                {/* photo=<img src={Tobi} alt ="" style ={{ width: '178px', height: '178', borderRadius:"100px"}}/> */}
                
        </div>
        <BenchMarks/>
        <div style={{paddingBottom: '500px'}}/>
    </div>
    </>
    )
}
}