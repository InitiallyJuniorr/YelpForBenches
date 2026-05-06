import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Test from './Test.jsx'
import Login from './Login.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Test />
    <Login />
    <App />
  </StrictMode>
)
