const NONE = 0;
const PLAYER = 1;
const CPU = 2;
const SCREEN_SIZE = 388;
const BOX_SIZE = Math.floor(SCREEN_SIZE / 3);
const MAX_GAMES_PLAYED = 5;

let canvas = null;
let ctx = null;
let board = [];
let currentTurn = null;
let lastStart = CPU;
let isPlaying = false;
let numGamesPlayed = 0;

const drawX = (x, y) => {
  const halfSize = BOX_SIZE / 2 - 10;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - halfSize, y - halfSize);
  ctx.moveTo(x, y);
  ctx.lineTo(x + halfSize, y - halfSize);
  ctx.moveTo(x, y);
  ctx.lineTo(x - halfSize, y + halfSize);
  ctx.moveTo(x, y);
  ctx.lineTo(x + halfSize, y + halfSize);
  ctx.closePath();
  ctx.stroke();
};

const drawO = (x, y) => {
  const halfSize = BOX_SIZE / 2 - 10;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, halfSize, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawBoard = () => {
  ctx.strokeStyle = '#DEDEDE';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(BOX_SIZE * i, 0);
    ctx.lineTo(BOX_SIZE * i, SCREEN_SIZE);
  }
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(0, BOX_SIZE * i);
    ctx.lineTo(SCREEN_SIZE, BOX_SIZE * i);
  }
  ctx.closePath();
  ctx.stroke();
};

const draw = board => {
  ctx.clearRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
  drawBoard();
  for (let i = 0; i < 9; i++) {
    const [x, y] = indToPos(i);
    if (board[i] === PLAYER) {
      drawX(x * BOX_SIZE + BOX_SIZE / 2, y * BOX_SIZE + BOX_SIZE / 2);
    } else if (board[i] === CPU) {
      drawO(x * BOX_SIZE + BOX_SIZE / 2, y * BOX_SIZE + BOX_SIZE / 2);
    }
  }
};

const clear = () => {
  ctx.clearRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
};

const agentToId = agent => {
  let id = '';
  if (agent === PLAYER) {
    id = 'player-score';
  } else {
    id = 'cpu-score';
  }
  return id;
};

const indToPos = i => {
  return [Math.floor(i / 3), i % 3];
};

const setScore = (agent, value) => {
  document.getElementById(agentToId(agent)).innerHTML = value;
};

const getScore = agent => {
  return parseInt(document.getElementById(agentToId(agent)).innerHTML) || 0;
};

const areAllEqual = arr => {
  return arr[0] !== NONE && arr[0] === arr[1] && arr[0] === arr[2];
};

const pointRectCollides = (x, y, x1, y1, x2, y2) => {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
};

const doCPUTurn = () => {
  let ctr = 0;
  let i = 0;
  do {
    ctr++;
    i = Math.floor(Math.random() * 9);
    if (ctr > 1000) {
      throw new Error('Randomness is broken');
    }
  } while (board[i] != NONE);
  onPositionSelected(i);
};

const getGameResult = board => {
  let victor = -1;
  if (areAllEqual(board.slice(0, 3))) {
    victor = board[0];
  } else if (areAllEqual(board.slice(3, 6))) {
    victor = board[3];
  } else if (areAllEqual(board.slice(6, 9))) {
    victor = board[6];
  } else if (areAllEqual([board[0], board[3], board[6]])) {
    victor = board[0];
  } else if (areAllEqual([board[1], board[4], board[7]])) {
    victor = board[1];
  } else if (areAllEqual([board[2], board[5], board[8]])) {
    victor = board[2];
  } else if (areAllEqual([board[0], board[4], board[8]])) {
    victor = board[0];
  } else if (areAllEqual([board[2], board[4], board[6]])) {
    victor = board[2];
  }

  if (victor > -1) {
    return victor;
  }

  for (let i = 0; i < 9; i++) {
    if (board[i] === NONE) {
      return -1;
    }
  }
  return NONE;
};

const getRandomPassiveAggressiveWinningPhrase = () => {
  const phrases = [
    'You win... Nice job?',
    'You must be so smart to be good at this game.',
    'You win.  No need to gloat.',
    'You are a "winner"',
    'You have somehow won.',
    'You won that game.',
    'You clicked correctly this time.',
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const getGloatingPhrase = i => {
  const phrases = [
    'HAHAHA YOU ACTUALLY LOST!',
    'AHAHAHA HOW CAN YOU BE THIS BAD?',
    'MUAHAHAHA PLEASE STOP! PLEASE STOP!!!',
  ];
  return phrases[i] || phrases[0];
};

const onGameOver = result => {
  numGamesPlayed++;
  const elem = document.getElementById(`game-result`);
  let tag = 'marquee';
  let innerHTML = `<div>`;
  if (result === NONE) {
    innerHTML += `<${tag}>TIE...</${tag}>`;
  } else if (result === PLAYER) {
    innerHTML += `<${tag}>${getRandomPassiveAggressiveWinningPhrase()}</${tag}>`;
    setScore(PLAYER, getScore(PLAYER) + 1);
  } else {
    innerHTML += `<${tag}>${getGloatingPhrase(getScore(CPU))}</${tag}>`;
    setScore(CPU, getScore(CPU) + 1);
  }

  if (numGamesPlayed === MAX_GAMES_PLAYED || getScore(CPU) >= 3) {
    setTimeout(() => {
      window.end();
    }, 6000);
  } else {
    innerHTML +=
      '<div style="display:flex; justify-content: center"><button onclick="newGame()"> Next Game! </button></div>';
    innerHTML += '</div>';
  }
  innerHTML += `<div>Game ${numGamesPlayed}/${MAX_GAMES_PLAYED}</div>`;
  elem.innerHTML = innerHTML;
};

const onPositionSelected = i => {
  const pos = board[i];
  if (pos === NONE) {
    board[i] = currentTurn;
    draw(board);

    const gameResult = getGameResult(board);

    if (gameResult === -1) {
      if (currentTurn === PLAYER) {
        currentTurn = CPU;
        setTimeout(() => {
          doCPUTurn();
        }, 250);
      } else {
        currentTurn = PLAYER;
      }
    } else {
      currentTurn = NONE;
      onGameOver(gameResult);
    }
  }
};

window.newGame = () => {
  board = [];
  for (let i = 0; i < 9; i++) {
    board.push(NONE);
  }

  document.getElementById('game-result').innerHTML = '';
  if (lastStart === PLAYER) {
    currentTurn = CPU;
    lastStart = CPU;
    setTimeout(() => {
      doCPUTurn();
    }, 250);
  } else {
    currentTurn = PLAYER;
    lastStart = PLAYER;
  }

  draw(board);
};

window.end = () => {
  const wins = getScore(PLAYER);
  const losses = getScore(CPU);
  if (losses >= 3) {
    window.notifyHighScore(-1);
  } else {
    window.notifyHighScore(wins.length);
  }
  window.menu();
};

let menuFlashInterval = 0;
window.start = () => {
  clear();
  clearInterval(menuFlashInterval);
  isPlaying = true;
  numGamesPlayed = 0;

  document.getElementById('score-area').style.display = 'flex';
  if (window.startButtonEnabled) {
    const startButton = document.getElementById('start');
    if (startButton) startButton.style.display = 'none';
  }

  setScore(PLAYER, 0);
  setScore(CPU, 0);
  window.newGame();
};

window.menu = () => {
  clear();
  clearInterval(menuFlashInterval);
  isPlaying = true;

  document.getElementById('score-area').style.display = 'none';
  if (window.startButtonEnabled) {
    const startButton = document.getElementById('start');
    if (startButton) startButton.style.display = 'block';
  }

  let flashOn = true;

  const drawMenu = () => {
    clear();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.font = '36px retro';
    ctx.textAlign = 'center';

    if (flashOn) {
      ctx.strokeText('Tic Tac Toe', canvas.width / 2, canvas.height / 4);
    } else {
      ctx.fillText('Tic Tac Toe', canvas.width / 2, canvas.height / 4);
    }

    ctx.font = '24px retro';
    ctx.fillText(
      'Insert Token To Play',
      canvas.width / 2,
      canvas.height / 2 + 94
    );
    ctx.fillText(
      '1 Token = 5 Games',
      canvas.width / 2,
      canvas.height / 2 + 94 + 32
    );

    drawX(96, 188);
    drawO(canvas.width - 96, 188);

    flashOn = !flashOn;
  };

  menuFlashInterval = setInterval(drawMenu, 1000);
  drawMenu();
};

window.init = () => {
  // need this to prevent load timeout in lib.js
  Module.jsLoaded();
  document.getElementById('game').style.display = 'flex';

  // need this so font doesn't pop into view jarringly
  setTimeout(function () {
    document.fonts
      .load('42px "retro"')
      .then(() => {
        menu();
      })
      .catch(() => {});
  }, 0);

  const canvasDiv = document.getElementById('canvas-area');
  canvas = document.createElement('canvas');
  canvas.width = SCREEN_SIZE;
  canvas.height = SCREEN_SIZE;
  ctx = canvas.getContext('2d');
  canvasDiv.innerHTML = '';
  canvasDiv.appendChild(canvas);

  canvas.addEventListener('mousedown', ev => {
    if (ev.button === 0) {
      if (currentTurn === PLAYER) {
        if (isPlaying) {
          const xClick = ev.offsetX;
          const yClick = ev.offsetY;
          for (let i = 0; i < 9; i++) {
            const [x, y] = indToPos(i);
            if (
              pointRectCollides(
                xClick,
                yClick,
                BOX_SIZE * x,
                BOX_SIZE * y,
                BOX_SIZE * (x + 1),
                BOX_SIZE * (y + 1)
              )
            ) {
              onPositionSelected(i);
            }
          }
        }
      }
    }
  });
};
