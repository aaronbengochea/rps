require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;

app.use(express.json())
app.use(cors())


app.get('/visit', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
    console.log("ping")
  });
  
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  