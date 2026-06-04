import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react';
import './components.css';

// PLACEHOLDER IMG
import Tobi from '../assets/tobi.jpg'

export function RecentReviews({name="Null", address="Null", review="Null", rating="Null", img="Tobi"})
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
                <img src={img} alt="" style={{height: '150px', width: '150px'}}/>
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

export default function ProfileBanner ({name="Null", tag="Null", tagClass="",photo, onPhotoUpload})
{
    const navigate = useNavigate();
    const handleLogout = async () => {
    navigate('/')
    }

    return(
        <>
        <div className="ProfileBanner"> 
            <div onClick={() => document.getElementById('pfp-upload').click()} style={{cursor: 'pointer'}}>
                <img src={photo} alt="" style={{height: '150px', width: '150px', borderRadius: '200px'}}/>
                <input 
                    id="pfp-upload"
                    type="file" 
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={onPhotoUpload}
                />
            </div>
            <div className="ProfileContent" style={{paddingLeft: '35px'}}>
                <h1>{name}</h1>
                <p className={`profile-tag ${tagClass}`}>{tag}</p>
                <button className='ProfileButton' onClick={handleLogout}><span>LogOut</span></button>
            </div> 
        </div>
        </>
    )
}