import React, { useState } from 'react'
import './Login.css'

export default function Login() {
    const [isLogin, setIsLogin] = React.useState(true);
    const [emailError,   setEmailError] = useState("");
    const [pwError,   setpwError] = useState("");
    const [email,   setEmail] = useState("");
    const [password, setPassword] = useState("");

    const toggleLogin = () => {
        setIsLogin(!isLogin);
    };  
    
    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setPassword(value);
        validateEmail(value);
        validatePassword(value);
    }

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(re.test(String(email).toLowerCase()));
    }

    const validatePassword = (password) => {
        const re = /^[\w]]{6,20}$/;
        setpwError(re.test(String(password)));
    }

    return (
        <div className="login-container">
            <h1>YelpForBenches©</h1>
            <div className="login-card">
               <h1>{isLogin ? "Login" : "Register"}</h1>    
               <button onClick={toggleLogin}>{isLogin ? "Create Account" : "Sign in"}</button>
               <input type="text" placeholder="Email" onChange={handleChange} />
               { (emailError && !(isLogin)) && <p className="error">error</p>}
               <input type="password" placeholder="Password" onChange={handleChange} />
                <button>Submit</button>
            </div>
        </div>
    );
}

