import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Login.css'
import './fooLogin.jsx'
import { validateEmail, validateUsername, validatePassword, PwError_Display } from '../utils/validate.jsx';
import gang from '../assets/gang.png'


export default function LogIn() {
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
    
    //Functions called when any input is given t
    const handleEChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value));
    }

    const handlePChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setpwError(validatePassword(value));
    }

    const handleUChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setUserError(validateUsername(value));
    }

    const isValidRegister = !emailError && !pwError && !isLogin && !userError
    const isValidLogin = !emailError && isLogin
    const invalidSubmission = !isValidRegister && !isValidLogin || email === ''
 
    // Handles submission of both Login and Register
    const handleSubmit = async () => {
        if (invalidSubmission) { 
            setSubmitted(true);
            return
        }

        const endpoint = isLogin ? '/login' : '/register';
        const payload = isLogin ? { email, password } : { email, password, username };

        // Try to POST Login credentials
        try {
            const res = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const data = await res.json()

            if (!res.ok) {
                setLoginError(data.error || "Invalid email or password");
                return; 
            }


            // Handle Login Success
            localStorage.setItem('token', data.token);
            navigate('/app');    
            }
        catch (err) {
            console.error(err)
        }
        // Always flags to set ReGex errors
        finally {
          setSubmitted(true);  
        }
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
                    <p className="guest" onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/home');
                    }}>Sign in Later</p>


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
