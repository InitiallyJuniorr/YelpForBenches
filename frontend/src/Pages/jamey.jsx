import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Login.css'
import './fooLogin.jsx'
import gang from '../assets/gang.png'


export default function Jamey() {

    const navigate = useNavigate(); 


    const [isLogin, setIsLogin] = useState(true);


    const [emailError,   setEmailError] = useState("");
    const [pwError,   setpwError] = useState("");
    const [userError, setUserError] = useState("");
    const [email,   setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMsg, setForgotMsg] = useState("");
    const [kkSlider, isKKSlider] = useState(true);
    
    const handleEChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    }

    const handlePChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    }

    const handleUChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        validateUsername(value);
    }

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!(re.test(String(email).toLowerCase())));
    }

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%&?])([\w@$!%&?]){8,}$/;
        setpwError(!(re.test(String(password))));
    }

    const validateUsername = (username) => {
        const re = /^[A-Za-zÀ-ÿ1-9_]{4,16}$/;
        setUserError(!(re.test(String(username))));
    }

    const handleSubmit = async () => {
        if (!(emailError) && !(pwError) && !(isLogin) && !(userError)){
            try {
                const res = await fetch("http://localhost:8080/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, username })
                })
                const data = await res.json()
                if (data.success) {
                    localStorage.setItem('token', data.token)
                    navigate('/app')
                }
            } catch (err) {
                console.error(err)
            }
        }
        else if (!(emailError) && isLogin) {
            const res = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem('token', data.token)
                navigate('/app')
            } else {
                setLoginError(data.error) 
            }
        }
        setSubmitted(true);
    }

    const handleForgot = async () => {
        const res = await fetch("http://localhost:8080/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: forgotEmail })
        })
        const data = await res.json()
        if (res.ok) setForgotMsg("Reset link sent! Check your email.")
        else setForgotMsg(data.error)
    }


    function PwError_Display({ password }) {
        const re_lowercase = /(?=.*[a-z])/;
        const re_uppercase = /(?=.*[A-Z])/;
        const re_digit = /(?=.*\d)/;
        const re_special = /(?=.*[@$!%&?])/;
        const re_8 = /^.{8,}$/;

    return (
        <div>
            { !(re_uppercase.test(String(password))) && <p className="error ">Password must include an uppercase letter.</p> }
            { !(re_lowercase.test(String(password))) && <p className="error ">Password must include a lowercase letter.</p> }
            { !(re_digit.test(String(password))) && <p className="error ">Password must include a digit.</p> }
            { !(re_special.test(String(password))) && <p className="error ">Password must include a special character from '@$!%&?'.</p> }
            { !(re_8.test(String(password))) && <p className="error ">Password must be at least 8 characters.</p> }
        </div>
    )
    }


    
   
    const toggleKKLogIn = () => {
        isKKSlider(!kkSlider);
        
    }
    const toggleKKSignIn = () => {
        setIsLogin(!isLogin);
        isKKSlider(!kkSlider);
    }

    return (
        <>
        {kkSlider &&
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
                    <button className="button" onClick={toggleKKLogIn}>Log In</button>
                    <div style={{padding: "10px"}}/>
                    <button className="button" onClick={toggleKKSignIn}>Sign Up</button>
                    <div style={{justifyContent: 'right',width: '287px', textAlign: 'center'}}>
                    <p className="guest" onClick={() => navigate('/home')}>Sign in Later</p>


                    </div>

                </div>
                
                </div>
        
                
                </div>
        </>
        }

        {!kkSlider && isLogin &&
            <>
            <div style={{justifyContent: 'right', display: 'flex'}}>
            <img src={gang} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0'}}/>
                <div className="loginCard" style={{paddingTop: '5%'}}>
                    <button className="back" onClick={toggleKKLogIn}>Back</button>
                    <h1>Benchmark</h1>
                    <div style={{width: '287px'}}>
                    <p1>In a world of Benches, be sure to find the right one for you.</p1>
                    </div>

                    <div style={{padding: "70px"}}/>
                    <p1>Email</p1>
                    <br/>
                    <input className='input'type="text" placeholder="Email" onChange={handleEChange} />
                    {/* needs styling */}
                    { emailError && !(isLogin) && (submitted) && <p className="error">Please enter a valid email address.</p>}
                    <div style={{padding: "10px"}}/>    
                    <p1>Password</p1>
                    <br/>
                    <input className='input' type="password" placeholder="Password" onChange={handlePChange} />
                    {/* needs styling */}
                    { pwError && !(isLogin) && (submitted) && <PwError_Display password={password} /> }
                    <div style={{padding: "10px"}}/>
                    <button className="button" onClick={handleSubmit}>Submit</button>

                    { loginError && <p className="error">{loginError}</p> }
                    
                    { isLogin && <p className="guest" onClick={() => setShowForgot(true)}>Forgot Password?</p> }
                    { showForgot && (
                    <div style={{justifyContent: 'flex-center', alignItems: 'center', display: 'flex'}}>
                        {/* add className */}
                        <input className="forgot" type="text" placeholder="Enter your email" onChange={e => setForgotEmail(e.target.value)}/>
                        <br/>
                        <button className="forgotbutton" onClick={handleForgot}>send</button>
                    
                        { forgotMsg && <p>{forgotMsg}</p> }
                        
                    </div>
                    
                    )}
                    <div style={{padding: "10px"}}/>
                    
                </div>
            </div>
            </>
        }

        {!kkSlider && !isLogin &&
            <>
            <div style={{justifyContent: 'right', display: 'flex'}}>
            <img src={gang} alt="" style={{height: '53%', width: '53%', margin: '0', padding: '0'}}/>
                <div className="loginCard" style={{paddingTop: '5%'}}>
                    <button className="back" onClick={toggleKKSignIn}>Back</button>
                    <h1>Benchmark Sign Up</h1>
                    <div style={{width: '287px'}}>
                    <p1>In a world of Benches, be sure to find the right one for you.</p1>
                    </div>

                    <div style={{padding: "40px"}}/>
                    <p1>Email</p1>
                    <br/>
                    <input className='input'type="text" placeholder="Email" onChange={handleEChange} />
                    {/* needs styling */}
                    { emailError && !(isLogin) && (submitted) && <p className="error">Please enter a valid email address.</p>}
                    <div style={{padding: "10px"}}/>
                    <p1>Password</p1>
                    <br/>
                    <input className='input' type="password" placeholder="Password" onChange={handlePChange} />
                    {/* needs styling */}
                    { pwError && !(isLogin) && (submitted) && <PwError_Display password={password} /> }
                    <div style={{padding: "10px"}}/>
                    <p1>Username</p1>
                    { !(isLogin) && <input className='input'type="text" placeholder="Username" onChange={handleUChange} /> }
                    { userError && !(isLogin) && (submitted) && <p className="error">Username must contain between 4-16 letters, numbers, and underscores.</p>}
                    <div style={{padding: "10px"}}/>

                    <button className="button" onClick={handleSubmit}>Submit</button>

                    { loginError && <p className="error">{loginError}</p> }

                    
                    
                </div>
            </div>
            </>
        }
        </>
    );
}
