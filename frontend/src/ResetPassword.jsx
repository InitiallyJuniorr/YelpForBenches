import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("")
    const [message, setMessage] = useState("")
    const [pwError, setpwError] = useState("")
    const [cpwError, setcpwError] = useState("")
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleNPChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        validatePassword(value);
    }

    const handleCPChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== newPassword) { setcpwError(true); }
        else { setcpwError(false); }
    }

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%&?])([\w@$!%&?]){8,}$/;
        setpwError(!(re.test(String(password))));
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

    const handleReset = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match")
            return
        }
        const res = await fetch("http://localhost:8080/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, newPassword })
                })
                const data = await res.json()
                if (res.ok) {
                    setMessage("Password reset successfully!")
                    setTimeout(() => navigate('/'), 2000)
                } else {
                    setMessage(data.error)
                }    
            
    }

    return (
        <div className="login-container">
            <h1>BenchMark©</h1>
            <div className="login-card">
                <h1>Reset Password</h1>
                <input 
                    type="password" 
                    placeholder="New Password" 
                    onChange={e => handleNPChange(e)}
                />
                { pwError && <PwError_Display password={newPassword} /> }
                <input 
                    type="password" 
                    placeholder="Re-Type New Password" 
                    onChange={e => handleCPChange(e)} 
                />
                { cpwError && <p className="error">Passwords dont match.</p>}

                <button onClick={handleReset}>Reset Password</button>
                { message && <p>{message}</p> }
            </div>
        </div>
    )
}