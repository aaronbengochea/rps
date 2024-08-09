require('dotenv').config()
const fs = require('fs');
const express = require('express');
const cors = require('cors')
const app = express();
/*const port = 3000;*/

app.use(express.json())
app.use(cors())

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});

app.get('/visit', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
    console.log("ping")
  });

app.get('/chichi', (req, res) => {
    res.json({ message: 'TES TEST Hello my cute lil kuromi baby' });
    console.log("ping")
  });

app.get('/bubba', (req, res) => {
    res.json({ message: 'Bubba stinks and smells like hay, haha he cant read this because he has a firefly phone' });
    console.log("ping")
  });
  
app.use((req, res, next) => {
    if (req.protocol === 'http') {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
      next();
    }
  });
/*
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
*/
  