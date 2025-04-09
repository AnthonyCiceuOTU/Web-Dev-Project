const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

let stats = {
    easy: { wins: 0, losses: 0, winstreak: 0 },
    hard: { wins: 0, losses: 0, winstreak: 0 }
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
    } else if (result === 'loss') {
      stats[difficulty].losses++;
      stats[difficulty].winstreak = 0;
    }
    res.json({ success: true, stats: stats[difficulty] });
  } else {
    res.status(400).json({ error: 'Invalid difficulty' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});