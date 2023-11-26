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
// import io from "socket.io-client";
function InitBoard() {
    //初始化棋盘数组
    for (var i = 0; i < 19; i++) {
        boardData[i] = [];
        for (var j = 0; j < 19; j++) {
            boardData[i][j] = 0;
        }
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
let socket = null
// 引入socket.io-client库
// import io from 'socket.io-client';
function testF() {
    // const express = require('express');
    // const http = require('http');
    // const socketIO = require('socket.io');
    // const cors = require('cors');

    // const app = express();
    // app.use(cors()); // 添加这一行以启用所有路由的 CORS

    // const server = http.createServer(app);
    // const io = socketIO(server);
    // 创建WebSocket对象，指定WebSocket服务器的地址
    socket = io('http://127.0.0.1:5000/');
    // 处理连接和断开事件
    socket.on('roomList', (res) => {
        console.log('Connected to server');
        console.log(res)
    });
    // // 监听WebSocket接收到消息事件
    // socket.addEventListener('message', (event) => {
    //     console.log('接收到消息:', event.data);
    // });

    // // 监听WebSocket连接关闭事件
    // socket.addEventListener('close', (event) => {
    //     console.log('WebSocket连接已关闭');
    // });

    // // 监听WebSocket连接发生错误事件
    // socket.addEventListener('error', (event) => {
    //     console.error('WebSocket连接发生错误:', event);
    // });

}

function send() {
    // Send a message from the client to the server
    socket.emit('message', 'Hello, server!');
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
        // RenderBoard()
        if (checkWin(playerType, row, col)) {

            console.log("Player:" + playerType + "Win!!!")
            alert("黑方赢！！！")
            InitBoard()
            // RenderBoard()
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
        // RenderBoard()
        if (checkWin(playerType, row, col)) {

            console.log("Player:" + playerType + "Win!!!")
            alert("白方赢！！！")
            InitBoard()
            // RenderBoard()
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
        if (i >= 0 && i < 19 && boardData[row][i] === player) {
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
        if (i >= 0 && i < 19 && boardData[i][col] === player) {
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
InitBoard()
RenderBoard()
