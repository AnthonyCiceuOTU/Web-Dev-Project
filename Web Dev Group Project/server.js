const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

let stats = {
    Easy: { wins: 0, losses: 0, winstreak: 0 },
    Hard: { wins: 0, losses: 0, winstreak: 0 }
  };
  
app.use(cors());
app.use(express.json());

//This is where stat tracking stuff would be

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });