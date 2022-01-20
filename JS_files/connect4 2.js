const gameBoard = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

const moveList = [];

class Player {
  constructor(number, color, human, opponent) {
    this.number = number;
    this.color = color;
    this.human = human;
    this.opponent = opponent;
  }
}

let player1;
let player2;
let player;
let cursor = -1;

async function initializeGame(p1, p2) {
  player1 = new Player(1, "red", p1, 2);
  player2 = new Player(2, "yellow", p2, 1);
  player = player1;
  $("button.mainMenu").addClass("hide");
  $("table").removeClass("hide");
  $("button.gamePlay").removeClass("hide");
  $("h1").html(" " + player.number);
  setTimeout(() => {
    if (!player.human) {
      computer();
    }
  }, 0);
}

$(" table.gameBoard td ").hover(
  function () {
    cursor = $(this).index();
    if (player.human) {
      $("table.visualizer td")[cursor].style.backgroundColor = player.color;
    }
  },
  function () {
    cursor = -1;
    if (player.human) {
      let topIndex = $(this).index();
      $("table.visualizer td")[topIndex].style.backgroundColor = "white";
    }
  }
);

function checkRow(array, value) {
  if (array.length < 4) {
    return false;
  } else {
    for (let i = 0; i < 4; i++) {
      if (array[i] != value) {
        const [head, ...tail] = array;
        return checkRow(tail, value);
      }
    }
    return true;
  }
}
function columnArray(column, board) {
  let colArr = [];
  for (let i = 5; i > -1; i--) {
    colArr.push(board[i][column]);
  }
  return colArr;
}

function shutOff() {
  $(" table.gameBoard td").off();
  $(" table.gameBoard td ").unbind("mouseenter", "mouseleave");
}

function checkGame(row, column) {
  let x = gameBoard[row];
  let diag1 = frontDiag(row, column, gameBoard);
  let diag2 = backDiag(row, column, gameBoard);
  let col = columnArray(column, gameBoard);
  if (
    checkRow(x, player.number) ||
    checkRow(col, player.number) ||
    checkRow(diag1, player.number) ||
    checkRow(diag2, player.number)
  ) {
    shutOff();
    $(" h1 ").html("Player " + player.number + " wins!");
  } else {
    if (gameBoard[0].includes(0)) {
      if (player == player1) {
        player = player2;
      } else {
        player = player1;
      }
      $("h1").html(" " + player.number);
      if (player.human) {
        if (cursor != -1) {
          $("table.visualizer td")[cursor].style.backgroundColor = player.color;
        }
      } else {
        computer();
      }
    } else {
      shutOff();
      $("table.visualizer td")[column].style.backgroundColor = "white";
      $(" h1 ").html("Game Over");
    }
  }
}

function dropChip(column, board, p) {
  for (let r = 5; r > -1; r--) {
    if (board[r][column] == 0) {
      board[r][column] = p.number;
      return r;
    }
  }
  return -1;
}

function undrop() {
  if(moveList.length != 0 && player.human){
    let lastMove = moveList.pop();
    console.log(lastMove)
    let [row, col] = [lastMove[0], lastMove[1]];
    gameBoard[row][col] = 0;
    console.log(gameBoard)
    let element = $("table.gameBoard")[0].rows[row].cells[col];
    element.style.backgroundColor = "white";
    if(player == player1){
      player = player2;
    } else {
      player = player1;
    }
  }
}

$(" table.gameBoard td").on("click", async function () {
  if (player.human) {
    let col = $(this).index();
    let r = dropChip(col, gameBoard, player);
    if (r != -1) {
      moveList.push([r, col])
      let element = $("table.gameBoard")[0].rows[r].cells[col];
      element.style.backgroundColor = player.color;
      $("table.visualizer td")[col].style.backgroundColor = "white";
      setTimeout(() => {
        checkGame(r, col);
      }, 0);
    }
  }
});
// undo button

// restart

function frontDiag(i, j, board) {
  let forward = [];
  let backward = [];

  let row = i;
  let column = j;

  while (row < 5 && column < 6) {
    forward.push(board[++row][++column]);
  }
  row = i;
  column = j;
  while (row > 0 && column > 0) {
    backward.unshift(board[--row][--column]);
  }
  return [...backward, board[i][j], ...forward];
}

function backDiag(i, j, board) {
  let forward = [];
  let backward = [];

  let row = i;
  let column = j;

  while (row > 0 && column < 6) {
    forward.push(board[--row][++column]);
  }
  row = i;
  column = j;
  while (row < 5 && column > 0) {
    backward.unshift(board[++row][--column]);
  }
  return [...backward, board[i][j], ...forward];
}

function scoringHeuristic(array, p, score) {
  const [head, ...tail] = array;
  let firstFour = [head, tail[0], tail[1], tail[2]];
  if (firstFour.every((x) => x == p.number)) {
    score += 50;
  }
  if (
    (head == 0 &&
      tail[0] == p.number &&
      tail[1] == p.number &&
      tail[2] == p.number) ||
    (head == p.number &&
      tail[0] == p.number &&
      tail[1] == p.number &&
      tail[2] == 0)
  ) {
    score += 5;
  }
  if (
    firstFour.every((x) => x != p.opponent) &&
    firstFour.filter((x) => x == p.number).length == 2
  ) {
    score += 1;
  }
  if (firstFour.every((x) => x == p.opponent)) {
    score -= 50;
  }
  if (
    (head == 0 &&
      tail[0] == p.opponent &&
      tail[1] == p.opponent &&
      tail[2] == p.opponent) ||
    (head == p.opponent &&
      tail[0] == p.opponent &&
      tail[1] == p.opponent &&
      tail[2] == 0)
  ) {
    score -= 5;
  }
  if (
    firstFour.every((x) => x != p.number) &&
    firstFour.filter((x) => x == p.opponent).length == 2
  ) {
    score -= 1;
  }
  if (tail.length > 3) {
    return scoringHeuristic(tail, p, score);
  } else {
    return score;
  }
}

function evalBoard(board, p) {
  let eval = 0;

  let positiveDiag = [];
  let backwardDiag = [];
  let columns = [];

  for (let i = 0; i < 7; i++) {
    columns.push(columnArray(i, board));
  }
  for (let r = 5; r > 2; r--) {
    positiveDiag.push(backDiag(r, 0, board));
    positiveDiag.push(backDiag(5, r - 2, board));
  }
  for (let x = 0; x < 3; x++) {
    backwardDiag.push(frontDiag(x, 0, board));
    backwardDiag.push(frontDiag(0, x + 1, board));
  }
  eval += [positiveDiag, backwardDiag, columns, board]
    .map((y) =>
      y
        .map((x) => scoringHeuristic(x, p, eval))
        .reduce((previous, current) => previous + current)
    )
    .reduce((previous, current) => previous + current);

  return p == player1 ? eval : -1 * eval;
}

function miniMax(board, depth, p, alpha, beta) {
  let moves = [0, 1, 2, 3, 4, 5, 6];
  let valid_moves = moves.filter((x) => board[0][x] == 0);
  if (depth == 0 || valid_moves.length == 0) {
    return [null, evalBoard(board, p)];
  }

  if (p == player1) {
    let bestMove = null;
    for (const i of valid_moves) {
      let board_ = JSON.parse(JSON.stringify(board));
      dropChip(i, board_, p);
      let mini = miniMax(board_, depth - 1, player2, alpha, beta);
      let score = mini[1];
      if (score > alpha) {
        alpha = score;
        bestMove = i;
      }
      if (alpha > beta) {
        break;
      }
    }
    return [bestMove, alpha];
  } else {
    let bestMove = null;
    for (const i of valid_moves) {
      let board_ = JSON.parse(JSON.stringify(board));
      dropChip(i, board_, p);

      let mini = miniMax(board_, depth - 1, player1, alpha, beta);
      let score = mini[1];
      if (score < beta) {
        beta = score;
        bestMove = i;
      }
      if (beta < alpha) {
        break;
      }
    }
    return [bestMove, beta];
  }
}
// find valid locations at each board, make a copy of the board
// drop a chip for each location, calculate the minimax for that board
function computer() {
  let algo = miniMax(
    gameBoard,
    6,
    player,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );
  let c = algo[0];
  let r = dropChip(c, gameBoard, player);
  moveList.push([r, c])
  let element = $("table.gameBoard")[0].rows[r].cells[c];
  element.style.backgroundColor = player.color;
  $("table.visualizer td")[c].style.backgroundColor = "white";
  setTimeout(() => {
    checkGame(r, c);
  }, 0);
}

//restart

//main menu

//undo
