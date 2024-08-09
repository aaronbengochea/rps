import { useState, useEffect } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(''); // State to hold the message

  useEffect(() => {
    // Make the GET request when the component mounts
    axios.get('https://rps-i38q.onrender.com/visit')
      .then((response) => {
        setMessage(response.data.message); // Set the message from the response
      })
      .catch((error) => {
        console.error('Error fetching the message:', error);
        setMessage('Error fetching the message');
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p className="message">
        {message ? `Message: ${message}` : 'Loading...'} {/* Display the message */}
      </p>
    </>
  );
}

export default App;
