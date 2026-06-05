import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import App from './App.jsx'
import { Home } from './Pages/Home.jsx'
import { Profile } from './Pages/Profile.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import SignUp from './Pages/Signup.jsx'
import LoggedIn from './Pages/loggedin.jsx'
import LogIn from './Pages/finalLogIn.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/app" element={<App />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/foo" element={<Login />} /> 
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/loggingin" element={<LoggedIn />} /> 
      </Routes>
    </BrowserRouter>
  </StrictMode>
)