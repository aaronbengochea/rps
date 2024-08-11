import React, { useState, useEffect } from 'react';
import env from 'react-dotenv';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  const baseURL = process.env.REACT_APP_IS_LOCAL === 'true'
    ? env.LOCAL_URL
    : env.PROD_URL;

  useEffect(() => {
    console.log(baseURL)

    const url = `${baseURL}/visit`
    // Making the GET request to localhost:5000
    axios.get(url)
      .then(response => {
        // Set the message state with the data received
        setMessage(response.data.message);
        console.log(response.data.message);
        console.log(process.env.REACT_APP_IS_LOCAL) // Assuming the response has a message field
      })
      .catch(error => {
        console.error('There was an error making the GET request!', error);
        setMessage('Error fetching message'); // Set a fallback message in case of error
      });
  }, []); 
  

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
