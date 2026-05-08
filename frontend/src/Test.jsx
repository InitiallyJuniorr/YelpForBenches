import { useState } from 'react'
import './Test.css'

function Test() {
  const [ description, setDescription ] = useState("");

  async function getDescription(lat, long) {
    try {
      const response = await fetch(`
        http://localhost:8080/bench?lat=${lat}&long=${long}
        `);
      const data = await response.json();
      setDescription(data.description);
    } catch(error) {
      console.log(`Error message: `, error);
    }
  }

  function resetDescription() {
    setDescription( "" );
  }

  const [lat, setLat ] = useState('');
  const [ long, setLong ] = useState('');
  
  return (
  <>
    <input
      type="text"
      value={lat}
      onChange={(e) => setLat(e.target.value)}
    />
    <input
      type="text"
      value={long}
      onChange={(e) => setLong(e.target.value)}
    />
    <p>{description}</p>
    <button onClick={() => getDescription(lat, long)}>Press me!</button>
    <button onClick={() => resetDescription()}>Reset Description</button>
  </>
  )
}

export default Test
