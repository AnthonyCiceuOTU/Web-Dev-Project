const board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let difficulty = "easy";

function renderBoard() {
  $('#board').empty();
  board.forEach((cell, index) => {
    const div = $('<div class="cell"></div>');
    div.attr('data-index', index);

    if (cell) {
      const svg = createSVG(cell);
      div.append(svg);
    }

    $('#board').append(div);
  });
}

function createSVG(mark) {
  const svg = d3.create("svg:svg");
  if (mark === "X") {
    svg.append("line").attr("x1", "20").attr("y1", "20").attr("x2", "80").attr("y2", "80").attr("stroke", "red").attr("stroke-width", 5);
    svg.append("line").attr("x1", "80").attr("y1", "20").attr("x2", "20").attr("y2", "80").attr("stroke", "red").attr("stroke-width", 5);
  } else {
    svg.append("circle").attr("cx", "50").attr("cy", "50").attr("r", "30").attr("stroke", "blue").attr("stroke-width", 5).attr("fill", "none");
  }
  return svg.node();
}

function checkWinner() {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] == "X") updateStats("win");
      else updateStats("loss");
      return board[a];
    }
  }
  return board.includes("") ? null : "Draw";
}

function updateStats(result) {
  fetch('http://localhost:3000/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty, result })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Full response from server:', data);
    renderStats(data.stats);
  });
}

function renderStats(statsObj) {
  if (!statsObj) return;
  
  console.log('Updating Stats');
  $(`#${difficulty.toLowerCase()}-wins`).text(statsObj.wins);
  $(`#${difficulty.toLowerCase()}-losses`).text(statsObj.losses);
  $(`#${difficulty.toLowerCase()}-winstreak`).text(statsObj.winstreak);
}

function easyAIMove() {
  const emptyIndexes = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  const move = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  if (move !== undefined) {
    board[move] = "O";
  }
}

function hardAIMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  if (move !== undefined) board[move] = "O";
}

const scores = {
  O: 1,
  X: -1,
  Draw: 0
};

function minimax(newBoard, depth, isMaximizing) {
  let result = checkWinner();
  if (result !== null) return scores[result];

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = "";
      }
    }
    return best;
  }
}

function aiMove() {
  if (difficulty === "easy") {
    easyAIMove();
  } else {
    hardAIMove();
  }
  renderBoard();
  const result = checkWinner();
  if (result) {
    gameOver = true;
    $('#status').text(result === 'Draw' ? "It's a draw!" : `${result} wins!`);
  } else {
    currentPlayer = "X";
  }
}

function handleClick(index) {
  if (!gameOver && board[index] === "" && currentPlayer === "X") {
    board[index] = currentPlayer;
    currentPlayer = "O";
    renderBoard();
    const result = checkWinner();
    if (result) {
      gameOver = true;
      $('#status').text(result === 'Draw' ? "It's a draw!" : `${result} wins!`);
    } else {
      setTimeout(aiMove, 300);
    }
  }
}

$('#board').on('click', '.cell', function () {
  const index = $(this).data('index');
  handleClick(index);
});

$('#restartBtn').click(() => {
  board.fill("");
  currentPlayer = "X";
  gameOver = false;
  $('#status').text("");
  renderBoard();
});

$('#statsBtn').click(() => {
  fetch('http://localhost:3000/api/stats')
    .then(res => res.json())
    .then(data => {
      renderStats(data.stats);
      $('#status').text("");
      $('#homePage').hide();
      $('#statsPage').fadeIn();
    })
    .catch(err => {
      console.error('Failed to load stats:', err);
    });
});

$('#statsBackBtn').click(() => {
  board.fill("");
  currentPlayer = "X";
  gameOver = false;
  $('#status').text("");
  $('#statsPage').hide();
  $('#homePage').fadeIn();
  renderBoard();
});

$('#gameBackBtn').click(() => {
  board.fill("");
  currentPlayer = "X";
  gameOver = false;
  $('#status').text("");
  $('#gamePage').hide();
  $('#homePage').fadeIn();
  renderBoard();
});

$('#playBtn').click(() => {
  $('#difficultyOptions').fadeIn();
  $('#playBtn').hide();
});

$('#easyBtn').click(() => {
  difficulty = "easy";
  $('#homePage').hide();
  $('#gamePage').fadeIn();
  renderBoard();
});

$('#hardBtn').click(() => {
  difficulty = "hard";
  $('#homePage').hide();
  $('#gamePage').fadeIn();
  renderBoard();
});