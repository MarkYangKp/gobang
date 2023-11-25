//棋盘数据  0 为空 1为黑 2为白
var boardData = [[]];
//记录棋谱
var chessManuals = [
    // {"userType":null,"pos":{"x":null,"y":null}}
]
//记录上一次点击的格子
var lastBlock = {
    "row": null, "col": null, "lastEvent": null
}
//初始化棋盘数组
for (var i = 0; i < 19; i++) {
    boardData[i] = [];
    for (var j = 0; j < 19; j++) {
        boardData[i][j] = 0;
    }
}

function initBoard() {
    const boardElement = document.getElementById('boardPad');
    boardElement.innerHTML = '';
    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell-null';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', chooseBlock);
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
var playerType = 1
function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    console.log(event)
    //判断黑白方
    if (playerType == 1) {
        //显示黑棋
        event.target.classList.remove("cell-null")
        event.target.classList.remove("cell-white")
        event.target.classList.remove("cell-enter")
        event.target.classList.add("cell-black")


        boardData[row][col] = 1
        chessManual = {
            "userType": playerType,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        chessManuals.push(chessManual)
        playerType = 2
    } else if (playerType == 2) {
        //显示白棋
        event.target.classList.remove("cell-null")
        event.target.classList.remove("cell-black")
        event.target.classList.remove("cell-enter")
        event.target.classList.add("cell-white")

        boardData[row][col] = 2
        chessManual = {
            "userType": playerType,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        chessManuals.push(chessManual)
        playerType = 1

    }

    console.log(boardData)
    console.log(chessManuals)
}

function chooseBlock(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (lastBlock.col == col && lastBlock.row == row) {
        handleCellClick(event)
    } else {
        if (lastBlock.lastEvent != null) {
            lastBlock.lastEvent.target.classList.remove("cell-enter")
            lastBlock.lastEvent.target.classList.add("cell-null")
            console.log("ww")
        }

        event.target.classList.add("cell-enter")
        lastBlock.col = col
        lastBlock.row = row
        lastBlock.lastEvent = event
    }
    console.log(lastBlock)
}

initBoard()
