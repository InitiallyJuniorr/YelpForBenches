import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { NavBar } from './Components/Navbar.jsx'
import MapController from './Map/MapController.jsx'
import ResetPassword from './ResetPassword.jsx'


const defaultCenter = [34.0696, -118.4448] // UCLA area
const API_KEY = import.meta.env.VITE_MAPTILER_KEY

function App() {

  return (
    <>

      <NavBar/>
      
      <section id="center">
        <div className="page" style={{ display: 'block', width: '100%', height: '100%' }}>
          <MapController />
        </div>
      </section>
    </>
  )
}

export default App
