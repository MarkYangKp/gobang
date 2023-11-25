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
// 引入socket.io-client库
// import io from 'socket.io-client';
function testF() {
    // 连接到后端的Socket.IO服务器
    const socket = io('http://127.0.0.1:5000');

    // 发送joinRoom事件
    socket.emit('joinRoom', {
        userID: 'yourUserID',  // 替换为实际的用户ID
        roomID: 'yourRoomID'   // 替换为实际的房间ID
    });

    // 监听game_start事件
    socket.on('game_start', (data) => {
        console.log('游戏开始:', data);

        // 在这里处理游戏开始的逻辑
        // 例如，更新页面上的内容，显示游戏界面等
    });

    // 监听Error事件
    socket.on('Error', (errorMessage) => {
        console.error('发生错误:', errorMessage);

        // 在这里处理错误的逻辑
        // 例如，显示错误消息给用户等
    });

}


function isPlayChess() {

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