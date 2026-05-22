import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
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


    return (
        <div className="login-container">
            <h1>YelpForBenches©</h1>
            <div className="login-card">
               <h1>{isLogin ? "Login" : "Register"}</h1>    
               <button onClick={toggleLogin}>{isLogin ? "Create Account" : "Sign in"}</button>
               <input type="text" placeholder="Email" onChange={handleEChange} />
               { emailError && !(isLogin) && (submitted) && <p className="error">Please enter a valid email address.</p>}
               <input type="password" placeholder="Password" onChange={handlePChange} />
                { pwError && !(isLogin) && (submitted) && <PwError_Display password={password} /> } 
                <button onClick={handleSubmit}>Submit</button>
                <p className="guest" onClick={() => navigate('/app')}>Sign in Later</p>
            </div>
        </div>
    );
}

