require('dotenv').config()
const { WebSocketServer } = require('ws')
const http = require('http')
const uuidv4 = require('uuid').v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 5555;

const clients = {};

server.listen(port, () => {
  console.log(`WS server running on port ${port}`)
})

wsServer.on('connection', function(connection) {
  const uid = uuidv4();
  console.log(`Received a new connection`);

  clients[uid] = connection;
  console.log(`${uid} connected`);
})

