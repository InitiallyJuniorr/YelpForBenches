import React from 'react';
import './components.css';

// PLACEHOLDER IMG
import Tobi from '../assets/tobi.jpg'

export function RecentReviews({name="Null", address="Null", review="Null", rating="Null"})
{
    return(
    <>
        <div>
            <div className="ProfileReviews">
                <div style={{paddingTop: '10px'}}>
                    <h1>{name}</h1>
                
                    <p1 style={{paddingBottom: '0px'}}>{address}</p1>

                    <h3 style={{paddingBottom: '0px'}}>{rating}</h3>

                    <h2 style={{paddingBottom: '0px'}}>My Review</h2>
            
                    <div className="review">
                        <p1>{review}</p1>
                    </div>
                </div>
                <img src={Tobi} alt="" style={{height: '150px', width: '150px'}}/>
            </div>
           
        </div>
        
        <div style={{paddingTop: '23px'}}/>
        

    </>
    )
}

export function BenchMarks()
{
    return (
        <>
            <div className="ProfileBenchMarks">
            <h1>My BenchMarks</h1>
            </div>
        </>

    )
}

function profilePhoto()
{

}

// when adding multiple inputs, format {like, this}
export default function ProfileBanner ({name="Null", tag="Null", photo})
{
    return(
        <>
 

        <div className="ProfileBanner"> 
            <img src={Tobi} alt="" style={{height: '150px', width: '150px', borderRadius: '200px'}}/>
            <div className="ProfileContent" style={{paddingLeft: '29px'}}>

                <h1>{name}</h1>
                <p1>{tag}</p1>
                {/* <div style={{justifyContent: "left",}}>{photo}</div> */}
                
                <button className='ProfileButton'>
                    <s1>Edit</s1>
                </button>
                <button className='ProfileButton'>
                    <s1>Share</s1>
                </button>

                {/* TODO: implement this */}
                <button className='ProfileButton'>
                    <s1>LogOut</s1>
                </button>
            </div> 

            
        </div>
        



        </>
    )
}