import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validatePassword, PwError_Display } from '../utils/validate.jsx';


export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("")
    const [message, setMessage] = useState("")
    const [pwError, setpwError] = useState("")
    const [cpwError, setcpwError] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    // Calls regex on the new password when updated
    const handleNPChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setpwError(validatePassword(value));
    }

    // Set a password error if the re-types password does not match the original
    const handleCPChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== newPassword) { setcpwError(true); }
        else { setcpwError(false); }
    }

    const passwordError = pwError || cpwError

    // Handles submission of a replacement password
    const handleReset = async () => {
        if (passwordError) {
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