import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [bench, setBench] = useState( {} );

  async function getBench() {
    try {
      const response = await fetch('http://localhost:8080/api/bench');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setBench(data);
    } catch(error) {
      console.log(`Error message: `, error);
    }
  }

  async function resetBench() {
    setBench( {} );
  }

  return (
    <>
        {bench && bench.name}
        <button onClick={() => getBench()}>Press me!</button>
        <button onClick={() => resetBench()}>Destroy Benchamin</button>
    </>
  )
}

export default App
