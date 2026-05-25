import React from "react"
import './fooLogin.css'
import '../Components/components.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SignUp()
{
        const navigate = useNavigate(); 
        const [isLogin, setIsLogin] = useState(true);
        const [emailError,   setEmailError] = useState("");
        const [pwError,   setpwError] = useState("");
        const [email,   setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [submitted, setSubmitted] = useState(false);
    
        const toggleLogin = () => {
            setIsLogin(!isLogin);
        };  
        
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
    
        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailError(!(re.test(String(email).toLowerCase())));
        }
    
        const validatePassword = (password) => {
            const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%&?])([\w@$!%&?]){8,}$/;
            setpwError(!(re.test(String(password))));
        }
    
        const handleSubmit = async () => {
            if (!(emailError) && !(pwError) && !(isLogin)){
                try {
                    const res = await fetch("http://localhost:8080/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    })
                    const data = await res.json()
                    if (data.success) navigate('/app')  
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
                if (res.ok) navigate('/app')
            }
            setSubmitted(true);
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
    
    
    return(
        <>
        <div style={{overflow: 'auto'}}>
        <div style={{justifyContent: 'right', display: 'flex'}}>
        <div className="loginCard" style={{paddingTop: '8%'}}>
            <button onClick={() => navigate('/foo')}>back</button>

            <h1>Benchmark</h1>
            <div style={{width: '287px'}}>
            <p1>In a world of Benches, be sure to find the right one for you.</p1>
            </div>
            <div style={{padding: "115px"}}/>

            {/* ADD INPUT FIELDS HERE */}
            <p1>Email</p1>
            <input className="input" type="text" placeholder="Email" onChange={handleEChange} />
               { emailError && !(isLogin) && (submitted) && <p className="error">Please enter a valid email address.</p>}
            <div style={{padding: "1%"}}/>
            <p1>Password</p1>
            <input className="input"  type="password" placeholder="Password" onChange={handlePChange} />
                { pwError && !(isLogin) && (submitted) && <PwError_Display password={password} /> } 
            <div style={{padding: "1%"}}/>
            <button className="button" onClick={handleSubmit}>Sign Up</button>

            
           
        </div>
        </div>
        </div>
        </>
    )
}