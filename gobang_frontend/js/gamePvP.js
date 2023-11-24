function initBoard() {
    const boardElement = document.getElementById('boardPad');
    boardElement.innerHTML = '';
    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell-null';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}
function isPlayChess(){
    
}
var playerType = 0
function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    console.log(event)
    if (playerType == 0) {
        event.target.classList.remove("cell-null")
        event.target.classList.remove("cell-white")
        playerType = 1
        event.target.classList.add("cell-black")
    } else if (playerType == 1) {
        event.target.classList.remove("cell-null")
        event.target.classList.remove("cell-black")
        event.target.classList.add("cell-white")
        playerType = 0
    }

    console.log(event)
}
initBoard()