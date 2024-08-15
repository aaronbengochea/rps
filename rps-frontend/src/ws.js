import React, { useEffect, useState} from 'react';
import {
  Navbar,
  NavbarBrand,
  UncontrolledTooltip
} from 'reactstrap';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import './App.css';

const WS_URL = 'ws://127.0.0.1:10000';

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
  const [inMatch, setInMatch] = useState(false)
  const [matchID, setMatchID] = useState('')
  

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    retryOnError: true,
    shouldReconnect: () => true
  });

  const handlePlayAnother = () => {
    setInMatch(false);
    setMatchID('');
  }

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

    if(lastJsonMessage && lastJsonMessage.type === 'matchFound'){
      setInMatch(true);
      setMatchID(lastJsonMessage.data.matchID)
    }
  }, [lastJsonMessage]);

  

  return (
    <>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time rps matchmaker</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        {username2 ? (
          inMatch ? (
          <MatchSection matchID={matchID} onPlayAnother={handlePlayAnother}/>
        ) : (
          <MatchmakingSection />
          )
        ) : ( 
          <LoginSection onLogin={setUsername2}/>
          )}
      </div>
      <div>
        
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
  const { sendJsonMessage,lastJsonMessage, readyState } = useWebSocket(WS_URL, {
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

  useEffect(() => {
    if(lastJsonMessage && lastJsonMessage.type === 'matchFound') {
      console.log(lastJsonMessage)
    }
  }, [lastJsonMessage]);

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

function MatchSection({matchID, onPlayAnother}) {
  const [resultData, setResultData] = useState(null);
  const { sendJsonMessage,lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    share: true,
    retryOnError: true,
    shouldReconnect: () => true

  } )
  
  function handleSelection(selection) {
    if (readyState === ReadyState.OPEN){
      console.log('choice made')
      
      const uid = localStorage.getItem('uid')
      sendJsonMessage({
        type: 'playerChoice',
        uid: uid,
        matchID: matchID,
        choice: selection,
      })
    } else {
      console.log('WebSocket connection is not currently open, please refresh home')
    }
    // Implement the matchmaking logic here
  }

  // Gets me the matchID for this given match and sets it
  useEffect(() => {
    if(lastJsonMessage && lastJsonMessage.type === 'matchResult'){
      console.log(lastJsonMessage)
      setResultData(lastJsonMessage.data)
    }
  }, [lastJsonMessage]);
  
  return (
    <div className="match-section">
      <h2>Make Your Choice</h2>
      <button
        type="button"
        onClick={() => handleSelection('rock')}
        className="btn btn-primary">
        Rock
      </button>
      <button
        type="button"
        onClick={() => handleSelection('paper')}
        className="btn btn-primary">
        Paper
      </button>
      <button
        type="button"
        onClick={() => handleSelection('scissors')}
        className="btn btn-primary">
        Scissors
      </button>

      {resultData && (
        <div className="match-result">
        <h3>Match Result</h3>
        <p><strong>Player 1 Choice:</strong> {resultData.p1Choice}</p>
        <p><strong>Player 2 Choice:</strong> {resultData.p2Choice}</p>
        <p><strong>You are Player:</strong> {resultData.playerKey}</p>
        <p><strong>Result:</strong> {resultData.result}</p>
        <button
            type="button"
            onClick={onPlayAnother}  // Trigger the parent's callback to reset match state
            className="btn btn-secondary">
            Play Another?
          </button>
      </div>
      )}
    </div>
  );
}


export default WebSocketConnect;