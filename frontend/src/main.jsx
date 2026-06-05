import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { Home } from './Pages/Home.jsx'
import { Profile } from './Pages/Profile.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import LogIn from './Pages/finalLogIn.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/app" element={<App />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/reset-password" element={<ResetPassword/>} /> 
      </Routes>
    </BrowserRouter>
  </StrictMode>
)