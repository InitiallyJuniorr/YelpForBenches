import React from 'react'
import './fooLogin.css'
import '../Components/components.css'
import { useState } from 'react';
import SignUp from './Signup.jsx'

import Tobi from '../assets/tobi.jpg'
import gang from '../assets/gang.png'


// JAMEY HERE
import { useNavigate } from 'react-router-dom'









export default function LoginFoo() {

    const navigate = useNavigate(); 
    
    return(
        <>
        <div style={{overflow: 'auto'}}>
        <div style={{justifyContent: 'right', display: 'flex'}}>
        <img src={gang} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0'}}/>
        <div className="loginCard" style={{paddingTop: '8%'}}>
            <h1>Benchmark</h1>
            <div style={{width: '287px'}}>
            <p1>In a world of Benches, be sure to find the right one for you.</p1>
            </div>
            <div style={{padding: "100px"}}/>
            {/* <button className="button" onClick={() => setIsClicked(true)}>Log In</button> */}
            <button className="button" onClick={() => navigate('/loggingin')}>Log In</button>
            <div style={{padding: "10px"}}/>
            <button className="button" onClick={() => navigate('/signup')}>Sign Up</button>
            <div style={{justifyContent: 'right',width: '287px', textAlign: 'center'}}>
                <p1 onClick={() => navigate('/home')}>Enter as Guest</p1>
            </div>
            {/* <button className="button" onClick={SignUpClick}>Login</button> */}
            
            {/* <button className="button" onClick={() => setIsSigned(true)}>Sign Up</button> */}
        </div>
        
        </div>

        {/* width: 287px; */}
        </div>
        </>
    )
}
