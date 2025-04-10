const express = require('express');
const path = require('path');
//const http = require('http');
//const socketIo = require('socket.io');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const PORT = 3000;
const db = new Database('stats.db', { verbose: console.log });
//const server = http.createServer(app);
//const io = socketIo(server);

db.prepare(`
  CREATE TABLE IF NOT EXISTS stats (
    difficulty TEXT PRIMARY KEY,
    wins INTEGER,
    losses INTEGER,
    winstreak INTEGER,
    beststreak INTEGER
  )
`).run();
let localStats = { //Old local stats object
    easy: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 },
    hard: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 }
};
  
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  // Use path.join to create the correct absolute path
  // __dirname = directory of server.js
  // 'Testing.html' = the file within that directory
  res.sendFile(path.join(__dirname, 'Testing.html'));
});

// GET stats
app.get('/api/stats', (req, res) => {
  const result = db.prepare('SELECT * FROM stats').all(); // Get all stats
  if (result.length === 0) {
    // If no stats are in the database, initialize them
    db.prepare(`
      INSERT INTO stats (difficulty, wins, losses, winstreak, beststreak) VALUES
      ('easy', 0, 0, 0, 0),
      ('hard', 0, 0, 0, 0)
    `).run();
    return res.json({
      easy: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 },
      hard: { wins: 0, losses: 0, winstreak: 0, beststreak: 0 }
    });
  }
  // Format the result and send back
  const stats = result.reduce((acc, row) => {
    acc[row.difficulty] = row;
    return acc;
  }, {});
  res.json({
    dbStats: stats,
    localStats: localStats
  });  
});

// POST stats
app.post('/api/stats', (req, res) => {
  console.log(req.body);
  const { difficulty, result } = req.body;
  
  if (!difficulty || !result) {
    return res.status(400).json({ error: "Missing difficulty or result" });
  }
  
  const lStats = localStats[difficulty];
  const stat = db.prepare('SELECT * FROM stats WHERE difficulty = ?').get(difficulty);
  if (stat) {
    let wins = stat.wins;
    let losses = stat.losses;
    let winstreak = stat.winstreak;
    let beststreak = stat.beststreak;

    if (result === 'win') {
      wins++, lStats.wins++;
      winstreak++, lStats.winstreak++;
      if (lStats.winstreak > lStats.beststreak) {
        lStats.beststreak = lStats.winstreak;
        if (lStats.winstreak > beststreak) beststreak = lStats,winstreak;
      }
    } else if (result === 'loss') {
      losses++, lStats.losses++;
      winstreak = 0, lStats.winstreak = 0;
    }

    // Update the stats in the database
    db.prepare(`
      UPDATE stats SET wins = ?, losses = ?, winstreak = ?, beststreak = ?
      WHERE difficulty = ?
    `).run(wins, losses, winstreak, beststreak, difficulty);

    //io.emit('statsUpdated', stats);

    
    res.json({ success: true, stats: stat[difficulty] });
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