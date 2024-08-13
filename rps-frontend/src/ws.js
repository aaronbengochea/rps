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

function isUserRegistered(message) {
  let event = JSON.parse(message.data)
  return event.type === 'userRegister'
}

function isUserDisconnected(message) {
  let event = JSON.parse(message.data)
  return event.type === 'userDisconnect'
}

function isUID(message) {
  let event = JSON.parse(message.data)
  return event.type === 'uidReturn'
}

function WebSocketConnect() {
  const [username2, setUsername2] = useState('')
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    if(username2 && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        username: username2,
        type: 'userRegister'
      });
    }
  }, [username2, sendJsonMessage, readyState]);

  useEffect(() => {
    if(lastJsonMessage && lastJsonMessage.type === 'uidReturn') {
      const uid = lastJsonMessage.data.uid;
      localStorage.setItem('uid', uid)
      console.log(`${uid} stored in local storage!`)
    }
  }, [lastJsonMessage]);

  

  return (
    <>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time rps matchmaker</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        {username2 ? (<MatchmakingSection/>) : (<LoginSection onLogin={setUsername2}/>)}
      </div>
      <div>
        <RegisteredHistory/>
        <DisconnectedHistory/>
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

function RegisteredHistory() {
  const {lastJsonMessage} = useWebSocket(WS_URL, {
    share: true,
    filter: isUserRegistered
  })
  const activities = lastJsonMessage?.data.registeredActivity || []
  
  return (
    <ul>
      {activities.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
    </ul>
  )
}

function DisconnectedHistory() {
  const {lastJsonMessage} = useWebSocket(WS_URL, {
    share: true,
    filter: isUserDisconnected
  })
  const activities = lastJsonMessage?.data.disconnectedActivity || []
  
  return (
    <ul>
      {activities.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
    </ul>
  )
}


function MatchmakingSection() {
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    share: true,
    retryOnError: true,
    shouldReconnect: () => true

  } )

  function handleMatchmaking() {
    if (readyState === ReadyState.OPEN){

      console.log('matchmaking started')
      const uid = localStorage.getItem('uid')
      sendJsonMessage({
        type: 'beginMatchmaking',
        uid: uid
      })
    } else {
      console.log('WebSocket connection is not currently open, please refresh home')
    }
    // Implement the matchmaking logic here
  }

  return (
    <div className="matchmaking">
      <button
        type="button"
        onClick={handleMatchmaking}
        className="btn btn-success matchmaking__btn">
        Begin Matchmaking
      </button>
    </div>
  );
}



export default WebSocketConnect;