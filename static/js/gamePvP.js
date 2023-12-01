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
var socketio = null

var userID = null
var roomID = null
var isStart = false; //是否开始游戏
var player = 0 //玩家类型  1 2 
var isPlay = 0 //能否落子状态 0否 1能

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

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    console.log(event)
    //判断黑白方
    if (player == 1) {

        boardData[row][col] = 1
        chessManual = {
            "userType": player,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        chessManuals.push(chessManual)
        // RenderBoard()
        if (checkWin(player, row, col)) {

            console.log("Player:" + player + "Win!!!")
            alert("黑方赢！！！")
            InitBoard()
            // RenderBoard()
        }
    } else if (player == 2) {

        boardData[row][col] = 2
        chessManual = {
            "userType": player,
            "pos": {
                "x": col, "y": row  //x,y坐标和行列是相反的
            }
        }
        
        chessManuals.push(chessManual)

        if (checkWin(player, row, col)) {

            console.log("Player:" + player + "Win!!!")
            alert("白方赢！！！")
            InitBoard()
            // RenderBoard()
        }
    }
    // RenderBoard()
    data = {
        // userID:userID,
        roomID:roomID,
        player:player,
        row:row,
        col:col,
    }
    socketio.emit("fallChess",data)
    
    isPlay = 0
    console.log(boardData)
    console.log(chessManuals)
}
function SendAndReceive(){
    socketio.emit()
}
function chooseBlock(event) {
    if (isPlay == 0) {
        console.log("当前不是您落子")
    } else {
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

/**
 * PVP逻辑
 * 双方玩家进入房间 给服务器发送开始游戏信号
 * 服务器广播
 * 就收到开始后，玩家1开始下落子，其能否落子的状态为1，其玩家2的能否落子状态
 * 为0，落子后发送给服务器落子坐标，服务器广播给两位玩家最新的棋盘信息
 * 然后客户端更新棋盘信息，并判断如果能否状态为1则变成0，0变成1
 */

//下棋落子

//设置玩家状态
function StatusChecking() {
    if (player == 1) {
        if (isPlay == 1) {
            document.getElementById("Player1").classList.remove("await")
            document.getElementById("Player1").classList.add("play")
        } else {
            document.getElementById("Player1").classList.remove("play")
            document.getElementById("Player1").classList.add("await")
        }
    } else if (player == 2) {
        if (isPlay == 1) {
            document.getElementById("Player2").classList.remove("await")
            document.getElementById("Player2").classList.add("play")
        } else {
            document.getElementById("Player2").classList.remove("play")
            document.getElementById("Player2").classList.add("await")
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // 获取当前页面的URL
    var currentURL = window.location.href;
    // 创建URLSearchParams对象并传入URL
    var urlParams = new URL(currentURL);
    // 获取userID参数的值
    roomID = urlParams.searchParams.get('roomID');
    console.log(roomID)
    userID = localStorage.getItem('user_id');
    data = {
        roomID:roomID,
        userID:userID
    }
    socketio = io('http://10.12.112.166:99/');
    socketio.emit("joinRoom",data)
    socketio.on("joinRoom_success", (res) => {
        if(userID == res.player1){
            player = 1
        }else if(userID = res.player2){
            player = 2
        }
        console.log(player)
        if (res.state == 1) {
            isStart = true
            RenderBoard()
            if(player == 1){
                isPlay = 1
            }
            StatusChecking()
            console.log("isPlay:"+isPlay)
            socketio.on("fallChess_success",res1=>{
                
                var row = res1.row;
                var col = res1.col;
                var playerType = res1.player
                if(playerType == 1 && player == 2){
                    isPlay = 1;
                }else if(playerType == 2 && player == 1){
                    isPlay = 1;
                }else if(playerType == 1 && player == 1){
                    isPlay = 0;
                }else if(playerType == 2 && player == 2){
                    isPlay = 0;
                }
                console.log("fallChess_success isPlay"+isPlay)
                StatusChecking();
                boardData[row][col] = playerType
                RenderBoard();
            })
        } else {
            isStart = false
            document.getElementById('boardPad').innerHTML = "<h1>等待中，未开始</h1>";
        }
    })
});
function addClick() {
    const index = document.getElementById("indexPage")
    index.addEventListener("click", function () {
        window.location.href = "/";
    })
}
addClick()
InitBoard()
RenderBoard()
// var data = {
//     roomID:"roomID",
//     boardData:["row","col","1/2"],
//     player:"1/2"
// }