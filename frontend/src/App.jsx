import './App.css'
import 'leaflet/dist/leaflet.css'
import { NavBar } from './Components/Navbar.jsx'
import MapController from './Map/MapController.jsx'

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
