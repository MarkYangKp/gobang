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

//渲染棋盘
function RenderBoard() {
    const boardElement = document.getElementById('boardPad');
    boardElement.innerHTML = '';
    for (var i = 0; i < 19; i++) {
        for (var j = 0; j < 19; j++) {
            const cell = document.createElement('div');
            cell.dataset.row = i;
            cell.dataset.col = j;
            if (boardData[i][j] == 0) {
                cell.className = 'cell-null';
            } else if (boardData[i][j] == 1) {
                cell.className = 'cell-black';
            } else if (boardData[i][j] == 2) {
                cell.className = 'cell-white';
            }

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
        // event.target.classList.remove("cell-null")
        // event.target.classList.remove("cell-white")
        // event.target.classList.remove("cell-enter")
        // event.target.classList.add("cell-black")


        boardData[row][col] = 1
        chessManual = {
            "userType": playerType,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        chessManuals.push(chessManual)
        if (checkWin(playerType, row, col)) {
            console.log("Player:" + playerType + "Win!!!")
        }
        playerType = 2
    } else if (playerType == 2) {
        //显示白棋
        // event.target.classList.remove("cell-null")
        // event.target.classList.remove("cell-black")
        // event.target.classList.remove("cell-enter")
        // event.target.classList.add("cell-white")

        boardData[row][col] = 2
        chessManual = {
            "userType": playerType,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        chessManuals.push(chessManual)
        if (checkWin(playerType, row, col)) {
            console.log("Player:" + playerType + "Win!!!")
        }
        playerType = 1

    }
    RenderBoard()

    console.log(boardData)
    console.log(chessManuals)
}

function chooseBlock(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (boardData[row][col] == 0) {
        //判断如果两次点击为同一个坐标这进行落子，
        //否则清除上一次的样式，更新当前坐标样式
        if (lastBlock.col == col && lastBlock.row == row) {
            //落子
            handleCellClick(event)
        } else {
            //删除上一次方格的样式
            if (lastBlock.lastEvent != null) {
                lastBlock.lastEvent.target.classList.remove("cell-enter")
                // lastBlock.lastEvent.target.classList.add("cell-null")
                console.log("ww")
            }

            event.target.classList.add("cell-enter")
            lastBlock.col = col
            lastBlock.row = row
            lastBlock.lastEvent = event
        }
        console.log(lastBlock)
    } else {
        console.log("您不能在已落子的地方落子")
    }


}
//悔棋
function RetractChess() {
    boardData[chessManuals[chessManuals.length - 1].pos.y][chessManuals[chessManuals.length - 1].pos.x] = 0
    chessManuals.pop()
    boardData[chessManuals[chessManuals.length - 1].pos.y][chessManuals[chessManuals.length - 1].pos.x] = 0
    chessManuals.pop()
    RenderBoard()
}

function checkWin(player, row, col) {
    // 检查水平方向
    let count = 0;
    for (let i = col - 4; i <= col + 4; i++) {
        if ( i >= 0 && i < 19&&boardData[row][i] === player ) {
            count++;
            if (count === 5) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // 检查垂直方向
    count = 0;
    for (let i = row - 4; i <= row + 4; i++) {
        if (i >= 0 && i < 19 &&boardData[i][col] === player ) {
            count++;
            if (count === 5) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // 检查主对角线
    count = 0;
    for (let i = row - 4, j = col - 4; i <= row + 4 && j <= col + 4; i++, j++) {
        if (i >= 0 && i < 19 && j >= 0 && j < 19 && boardData[i][j] === player) {
            count++;
            if (count === 5) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // 检查副对角线
    count = 0;
    for (let i = row - 4, j = col + 4; i <= row + 4 && j >= col - 4; i++, j--) {
        if (i >= 0 && i < 19 && j >= 0 && j < 19 && boardData[i][j] === player) {
            count++;
            if (count === 5) {
                return true;
            }
        } else {
            count = 0;
        }
    }


    return false;
}
RenderBoard()
