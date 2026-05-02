import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [ bench, setBench ] = useState("");

  async function getBench() {
    try {
      const response = await fetch('http://localhost:8080/bench');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        console.log(`Got new bench: ${result}`);
      }
      const data = await response.json();
      setBench(data.title);
    } catch(error) {
      console.log(`Error message: `, error);
    }
  }

  async function resetBench() {
    setBench( "" );
  }

  return (
    <>
        <p>{bench}</p>
        <button onClick={() => getBench()}>Press me!</button>
        <button onClick={() => resetBench()}>Destroy!!!</button>
    </>
  )
}

export default App
