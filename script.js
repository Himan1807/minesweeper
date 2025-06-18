const size = 8;
const numMines = 10;
let board = [];
let revealed = [];
let minePositions = new Set()
let gameOver = false;

let timerInterval;
let timeElapsed = 0;
let revealedCount = 0;
let timerRunning = false;

const clickSound = document.getElementById('click-sound');
const mineSound = document.getElementById('mine-sound');
const winSound = document.getElementById('win-sound');


const boardEl = document.getElementById('game-board');
const messageEl = document.getElementById('message');

// initialize board
function createBoard() {
    board = Array.from({ length: size }, () => Array(size).fill(0));
    revealed = Array.from({ length: size }, () => Array(size).fill(false));
    minePositions = new Set();
    gameOver = false;
    messageEl.textContent = "";

    revealedCount = 0;
    document.getElementById('score').textContent = revealedCount;

    // clear board
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${size}, 40px)`;

    stopTimer(); // stop any previous timer
    timeElapsed = 0;
    timerRunning = false;
    document.getElementById('timer').textContent = timeElapsed;

    placeMines();
    countAdjacentMines();
    renderBoard();
}

// place mines randomly
function placeMines() {
    while (minePositions.size < numMines) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const pos = `${row},${col}`;
        if (!minePositions.has(pos)) {
            minePositions.add(pos);
            board[row][col] = 'M';
        }
    }
}

// count adjacent mines
function countAdjacentMines() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 'M') {
                continue;
            }
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nr = r + i;
                    const nc = c + j;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                        if (board[nr][nc] === 'M') {
                            count++;
                        }
                    }
                }
            }
            board[r][c] = count;
        }
    }
}

// render cells as buttons
function renderBoard() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', onCellClick);
            boardEl.appendChild(cell);
        }
    }
}

// handle cell click
function onCellClick(e) {
    if (gameOver) {
        return;
    }

    if (!timerRunning) startTimer();

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (revealed[row][col]) {
        return;
    }

    revealCell(row, col);

    if (board[row][col] === 'M') {
        mineSound.currentTime = 0;
        mineSound.play();
        showAllMines();
        endGame(false);
    } else if (checkWin()) {
        endGame(true);
    }
}

// reveal a cell(and neighbours if 0)
function revealCell(row, col) {
    if (row < 0 || row >= size || col < 0 || col >= size) {
        return;
    }

    const cellIndex = row * size + col;
    const cellDiv = boardEl.children[cellIndex];

    if (!revealed[row][col]) {
        revealed[row][col] = true;
        revealedCount++;
        document.getElementById('score').textContent = revealedCount;
    }

    // revealed[row][col] = true;

    cellDiv.classList.add('revealed');
    cellDiv.removeEventListener('click', onCellClick);

    if (board[row][col] === 'M') {
        cellDiv.textContent = '💣';
        cellDiv.classList.add('mine');
        return;
    }

    clickSound.currentTime = 0;
    clickSound.play();

    if (board[row][col] > 0) {
        cellDiv.textContent = board[row][col];
        cellDiv.dataset.number = board[row][col];

    } else {
        // reveal the neighbours recursively
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

// reveall all the mines
function showAllMines() {
    minePositions.forEach(pos => {
        const [r, c] = pos.split(',').map(Number);
        const idx = r * size + c;
        const cell = boardEl.children[idx];
        cell.textContent = '💣';
        cell.classList.add('mine', 'revealed');
        cell.removeEventListener('click', onCellClick);
    });
}

// check for win condition
function checkWin() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== 'M' && !revealed[r][c]) {
                return false;
            }
        }
    }
    return true;
}

// display appropriate win/loss message
function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    stopTimer();

    // if (won) {
    //     messageEl.textContent = "🎉 Congratulations! You've won!";
    // } else {
    //     messageEl.textContent = "💥 Oops! You hit a mine! Game over :(";
    // }
    if (won) {
        messageEl.style.backgroundColor = "#4caf50";
        messageEl.style.borderRadius = "8px";
        winSound.currentTime = 0;
        winSound.play();
        messageEl.textContent = "🎉 Congratulations! You've won!";
    } else {
        messageEl.style.backgroundColor = "#f44336";
        messageEl.style.borderRadius = "8px";
        messageEl.textContent = "💥 Oops! You hit a mine! Game over :(";
    }

}

function startTimer() {
    const icon = document.getElementById("timer-icon");
    icon.src = "Images/pause.png"; // NOT /Images
    icon.alt = "Pause";

    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(() => {
            timeElapsed++;
            document.getElementById('timer').textContent = timeElapsed;
        }, 1000);
    }
}

function stopTimer() {
    const icon = document.getElementById("timer-icon");
    icon.src = "Images/start.png";
    icon.alt = "Start";

    timerRunning = false;
    clearInterval(timerInterval);
}

// function toggleTimer() {
//     const toggleBtn = document.getElementById("toggle-timer");
//     if (timerRunning) {
//         stopTimer();
//         toggleBtn.textContent = "▶️";

//     } else {
//         startTimer();
//         toggleBtn.textContent = "⏸️";
//     }
// }

function toggleTimer() {
    // const toggleBtn = document.getElementById("toggle-timer");
    const icon = document.getElementById("timer-icon");

    if (timerRunning) {
        stopTimer();
        icon.src = "Images/start.png";
        // icon.alt = "Start";
    } else {
        startTimer();
        icon.src = "Images/pause.png";
        // icon.alt = "Pause";
    }
}


createBoard();