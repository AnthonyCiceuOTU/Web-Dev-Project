const express = require('express');
//const http = require('http');
//const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = 3000;
//const server = http.createServer(app);
//const io = socketIo(server);

let stats = {
    easy: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 },
    hard: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 }
};
  
app.use(cors());
app.use(express.json());

// GET stats
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// POST stats
app.post('/api/stats', (req, res) => {
  console.log(req.body);
  const { difficulty, result } = req.body;
  
  if (!difficulty || !result) {
    return res.status(400).json({ error: "Missing difficulty or result" });
  }
  if (stats[difficulty]) {
    if (result === 'win') {
      stats[difficulty].wins++;
      stats[difficulty].winstreak++;
      if (stats[difficulty].winstreak > stats[difficulty].beststreak) stats[difficulty].beststreak = stats[difficulty].winstreak;
    } else if (result === 'loss') {
      stats[difficulty].losses++;
      stats[difficulty].winstreak = 0;
    }

    //io.emit('statsUpdated', stats);

    res.json({ success: true, stats: stats[difficulty] });
  } else {
    res.status(400).json({ error: 'Invalid difficulty' });
  }
});

/*io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('statsUpdated', stats);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});*/

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});