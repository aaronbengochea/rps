require('dotenv').config()
const { WebSocket, WebSocketServer } = require('ws')
const http = require('http')
const uuidv4 = require('uuid').v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 5555;

const clients = {};

const users = {};

const liveGames = {};

const matchmaking = [];

const registeredActivity = [];

const disconnectedActivity = [];


const typesDef = {
  USER_REGISTER: 'userRegister',
  USER_DISCONNECT: 'userDisconnect',
  USER_ID_RETURN: 'uidReturn',
  BEGIN_MATCHMAKING: 'beginMatchmaking',
  MATCH_FOUND: 'matchFound',
  PLAYER_CHOICE: 'playerChoice',

}

server.listen(port, () => {
  console.log(`WS server running on port ${port}`)
})

wsServer.on('connection', function(connection) {
  const uid = uuidv4();
  clients[uid] = connection;
  console.log(`${uid} connected`);

  const userToken = {type: typesDef.USER_ID_RETURN}
  userToken.data = {uid}
  const finalUserToken = JSON.stringify(userToken)
  
  connection.send(finalUserToken)
  connection.on('message', (message) => handleMessage(message, uid))
  connection.on('close', () => handleDisconnect(uid))
})

function broadcastMessage(json) {
  const data = JSON.stringify(json)
  console.log(data)
  console.log(json)
  for(let uid in clients){
    let client = clients[uid];
    if(client.readyState === WebSocket.OPEN){
      client.send(data)
    }
  } 
  
}

function handleDisconnect(uid) {
  console.log(`${uid} disconnected`)
  const json = {type: typesDef.USER_DISCONNECT}
  const userCred = users[uid]?.username || uid;

  disconnectedActivity.push(`${userCred} closed the application.`)
  json.data = { disconnectedActivity }
  delete clients[uid];
  delete users[uid];
  broadcastMessage(json);
}

function handleMessage(message, uid){
  const dataFromClient = JSON.parse(message.toString())
  const json = {type: dataFromClient.type}

  console.log(dataFromClient.type, typesDef.PLAYER_CHOICE, dataFromClient.type === typesDef.PLAYER_CHOICE)

  if(dataFromClient.type === typesDef.USER_REGISTER){
    registeredActivity.push(`${dataFromClient.username} has joined the fun!`)

    const userInfo = {
      username: dataFromClient.username,
      uid: uid
    }

    const res = {
      username: dataFromClient.username,
      uid: uid,
      type: typesDef.USER_REGISTER,
    }
    res.data = {registeredActivity}
    
    users[uid] = userInfo
    broadcastMessage(res)

  } else if(dataFromClient.type === typesDef.BEGIN_MATCHMAKING){
    if( matchmaking.length > 0) {
      const opponentUID = matchmaking.shift();
      const matchID = uuidv4();

      const match = {
        p1: uid,
        p2: opponentUID,
        matchID: matchID,
        choices: {
          p1: '',
          p2: ''
        }
      }

      liveGames[matchID] = match

      const matchRes = {
        type: typesDef.MATCH_FOUND,
        data: {matchID: matchID, p1: users[uid], p2: users[opponentUID]}
      }

      clients[uid].send(JSON.stringify(matchRes))
      clients[opponentUID].send(JSON.stringify(matchRes))

      console.log(`Match started: ${users[uid].username} vs ${users[opponentUID].username} (Match ID: ${matchID})`)
    } else {
      matchmaking.push(uid);
      console.log(`${users[uid].username} added to matchmaking queue`);
    }

  } else if(dataFromClient.type === typesDef.PLAYER_CHOICE){     
      const { matchID, choice } = dataFromClient;
      const match = liveGames[matchID];
      console.log(match)
      
      if (!match) {
        console.error('Match not found:', matchID);
        return;
      }

      const playerKey = match.p1 === uid ? 'p1' : 'p2';
      match.choices[playerKey] = choice;
      console.log(match)
      const opponentKey = playerKey === 'p1' ? 'p2' : 'p1';
      if (match.choices[opponentKey]) {
        // Both players have made their choice
        const result = determineWinner(match.choices.p1, match.choices.p2);

        const matchResultFirstEntry = {
          type: 'matchResult',
          data: {
            matchID: matchID,
            p1Choice: match.choices.p1,
            p2Choice: match.choices.p2,
            result: result,
            playerKey: playerKey
          },
        }

        const matchResultSecondEntry = {
          type: 'matchResult',
          data: {
            matchID: matchID,
            p1Choice: match.choices.p1,
            p2Choice: match.choices.p2,
            result: result,
            playerKey: playerKey
          },
        };

        // Send result to both players
        clients[match.p1].send(JSON.stringify(playerKey === 'p1' ? matchResultForPlayerOne : matchResultForPlayerTwo));
        clients[match.p2].send(JSON.stringify(playerKey === 'p1' ? matchResultForPlayerOne : matchResultForPlayerTwo));

        // Optionally, remove the match from liveGames or mark it as completed
        delete liveGames[matchID];

      } else {
        console.log(`${users[uid].username} made their choice, waiting for the opponent.`);
      }
      
    
    } else {
      matchmaking.push(uid);
      console.log(`${users[uid].username} added to matchmaking queue`)
      const matchRes = {
        type: typesDef.BEGIN_MATCHMAKING,
        message: 'user has been added to the matchmaking queue'
      }
      clients[uid].send(JSON.stringify(matchRes))
    }
  }

  function determineWinner(p1Choice, p2Choice){
    if (p1Choice === p2Choice){
      return 'Draw'
    }

    if(
      (p1Choice === 'rock' && p2Choice === 'scissors') ||
      (p1Choice === 'scissors' && p2Choice === 'paper') ||
      (p1Choice === 'paper' && p2Choice === 'rock')
    ){
      return 'p1'
    } else {
      return 'p2'
    }
  }
  




