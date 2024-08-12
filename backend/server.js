require('dotenv').config()
const { WebSocket, WebSocketServer } = require('ws')
const http = require('http')
const uuidv4 = require('uuid').v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 5555;

const clients = {};

const users = {};

const matchmaking = [];

const userActivity = [];

const typesDef = {
  USER_EVENT: 'userevent',
  RPS_CHOICE: 'rpschoice'
}

server.listen(port, () => {
  console.log(`WS server running on port ${port}`)
})

wsServer.on('connection', function(connection) {
  const uid = uuidv4();
  console.log(`Received a new connection`);

  clients[uid] = connection;
  console.log(`${uid} connected`);
  connection.send(JSON.stringify(uid))
  connection.on('message', (message) => handleMessage(message, uid))
  connection.on('close', () => handleDisconnect(uid))
})

function broadcastMessage(json) {
  const data = JSON.stringify(json)
  for(let uid in clients){
    let client = clients[uid];
    if(client.readyState === WebSocket.OPEN){
      client.send(data)
    }
  }
}

function handleDisconnect(uid) {
  console.log(`${uid} disconnected`)
  const json = {type: typesDef.USER_EVENT}
  const userCred = users[uid]?.username || uid;

  userActivity.push(`${userCred} closed the application.`)
  json.data = { users, userActivity }
  console.log('from HD', json.data)
  delete clients[uid];
  delete users[uid];
  broadcastMessage(json);

}

function handleMessage(message, uid){
  const dataFromClient = JSON.parse(message.toString())
  const json = {type: dataFromClient.type}
  if(dataFromClient.type === typesDef.USER_EVENT){
    users[uid] = dataFromClient
    userActivity.push(`${dataFromClient.username} has joined the fun!`)
    json.data = { users, userActivity }
  }
  broadcastMessage(json)
}



