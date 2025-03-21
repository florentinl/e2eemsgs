import logo from './logo.svg'
import './App.css'
import init, { greet } from 'argon2wasm';
import { useEffect, useState } from 'react';

function App() {
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    init().then(() => {
      setIsReady(true)
    })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="App-link"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {isReady && greet("Jon Cena")}
        </a>
      </header>
    </div>
  )
}

export default App
