import React, { useEffect, useState} from 'react';
import {
  Navbar,
  NavbarBrand,
  UncontrolledTooltip
} from 'reactstrap';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import './App.css';

const WS_URL = 'ws://127.0.0.1:5555';

function isUserEvent(message) {
  let event = JSON.parse(message.data)
  return event.type === 'userevent'
}

function WebSocketConnect() {
  const [username2, setUsername2] = useState('')
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    console.log(username2)
    if(username2 && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        username: username2,
        type: 'userevent'
      });
    }
  }, [username2, sendJsonMessage, readyState]);

  return (
    <>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time rps matchmaker</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        <LoginSection onLogin={setUsername2}/> 
      </div>
      <div>
        <History/>
      </div>
    </>
  );
}

function LoginSection({ onLogin }) {
  const [username, setUsername] = useState('');
  useWebSocket(WS_URL, {
    share: true,
    filter: () => false
  });
  function logInUser() {
    if(!username.trim()) {
      return;
    }
    onLogin && onLogin(username);
  }

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="account__profile">
            <p className="account__name">Hello, user!</p>
            <p className="account__sub">Join to play rps!</p>
          </div>
          <input name="username" onInput={(e) => setUsername(e.target.value)} className="form-control" />
          <button
            type="button"
            onClick={() => logInUser()}
            className="btn btn-primary account__btn">Join</button>
        </div>
      </div>
    </div>
  );
}

function History() {
  const {lastJsonMessage} = useWebSocket(WS_URL, {
    share: true,
    filter: isUserEvent
  })
  const activities = lastJsonMessage?.data.userActivity || []
  
  return (
    <ul>
      {activities.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
    </ul>
  )
}

export default WebSocketConnect;