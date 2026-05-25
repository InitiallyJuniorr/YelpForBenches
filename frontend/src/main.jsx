import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import App from './App.jsx'
import { Home } from './Pages/Home.jsx'
import { Profile } from './Pages/Profile.jsx'
import LoginFoo from './Pages/fooLogin.jsx'
import ResetPassword from './ResetPassword.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<App />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/foo" element={<LoginFoo />} /> 
        <Route path="/reset-password" element={<ResetPassword/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)