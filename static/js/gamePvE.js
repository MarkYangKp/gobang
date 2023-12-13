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
var userName = null
var roomID = null
var isStart = false; //是否开始游戏
var player = 1 //玩家类型  1 2 
var isPlay = 1 //能否落子状态 0否 1能

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
        PlayMusic("failChess")

    } else if (player == 2) {

        boardData[row][col] = 2
        PlayMusic("failChess")

    }
    var data = {
        roomID: roomID,
        player: player,
        row: row,
        col: col,
    }
    // socketio.emit("fallChess", data)

    // isPlay = 0
    RenderBoard()
    console.log(AI(boardData, row, col) )

}
function SendAndReceive() {
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
                return true
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

document.addEventListener("DOMContentLoaded", function () {
    InitBoard()
    RenderBoard()

})

function PlayMusic(musicType) {
    // 创建音频上下文
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // 创建音频元素
    var audioElement = new Audio('/static/music/' + musicType + ".mp3");

    // 创建音频源
    var audioSource = audioContext.createMediaElementSource(audioElement);

    // 将音频源连接到音频上下文
    audioSource.connect(audioContext.destination);

    // 播放音乐
    audioElement.play();
}




/**人机对弈AI思路
 * 
 * 对于玩家每下的一步进行下两-三步判断是否会连成五子，若危险性过大，则进行防御
 * 否则找到自己最优的下子点，即AI下两-三步判断是否会连成五子
 * 
 */
function checkForThreeOnes(boardData, row, col, player) {
    // 检查水平方向
    let count = 0;
    var pos = []
    for (let i = col - 2; i <= col + 2; i++) {
        if (i >= 0 && i < 19 && boardData[row][i] === player) {
            count++;
            if (count === 3) {
                if (i == col) {
                    if (boardData[row][col - 3] == 0) {
                        pos = [row, col - 3]
                        return pos
                    } else {
                        pos = [row, col + 1]
                        return pos
                    }
                } else if (i == col + 1) {
                    if (boardData[row][col - 3] == 0) {
                        pos = [row, col - 2]
                        return pos
                    } else {
                        pos = [row, col + 2]
                        return pos
                    }
                } else if (i == col + 2) {
                    if (boardData[row][col - 3] == 0) {
                        pos = [row, col - 1]
                        return pos
                    } else {
                        pos = [row, col + 3]
                        return pos
                    }
                }
            }
        } else {
            count = 0;
        }
    }

    // 检查垂直方向
    count = 0;
    for (let i = row - 2; i <= row + 2; i++) {
        if (i >= 0 && i < 19 && boardData[i][col] === player) {
            count++;
            if (count === 3) {
                if (i == row) {
                    if (boardData[row - 3][col] == 0) {
                        pos = [row - 3, col]
                        return pos
                    } else {
                        pos = [row + 1, col]
                        return pos
                    }
                } else if (i == row + 1) {
                    if (boardData[row - 2][col] == 0) {
                        pos = [row - 2, col]
                        return pos
                    } else {
                        pos = [row + 2, col]
                        return pos
                    }
                } else if (i == row + 2) {
                    if (boardData[row - 1][col] == 0) {
                        pos = [row - 1, col]
                        return pos
                    } else {
                        pos = [row + 3, col]
                        return pos
                    }
                }
            }
        } else {
            count = 0;
        }
    }

    // 检查主对角线
    count = 0;
    for (let i = row - 2, j = col - 2; i <= row + 2 && j <= col + 2; i++, j++) {
        if (i >= 0 && i < 19 && j >= 0 && j < 19 && boardData[i][j] === player) {
            count++;
            if (count === 3) {
                if (i == row && j == col) {
                    if (boardData[row - 3][col - 3] == 0) {
                        pos = [row - 3, col - 3]
                        return pos
                    } else {
                        pos = [row + 1, col + 1]
                        return pos
                    }
                } else if (i == row + 1 && j == col + 1) {
                    if (boardData[row - 2][col - 2] == 0) {
                        pos = [row - 2, col - 2]
                        return pos
                    } else {
                        pos = [row + 2, col + 2]
                        return pos
                    }
                } else if (i == row + 2 && j == col + 2) {
                    if (boardData[row - 1][col - 1] == 0) {
                        pos = [row - 1, col - 1]
                        return pos
                    } else {
                        pos = [row + 3, col + 3]
                        return pos
                    }
                }
            }
        } else {
            count = 0;
        }
    }

    // 检查副对角线
    count = 0;
    for (let i = row - 2, j = col + 2; i <= row + 2 && j >= col - 2; i++, j--) {
        if (i >= 0 && i < 19 && j >= 0 && j < 19 && boardData[i][j] === player) {
            count++;
            if (count === 3) {
                if (i == row && j == col) {
                    if (boardData[row - 3][col + 3] == 0) {
                        pos = [row - 3, col + 3]
                        return pos
                    } else {
                        pos = [row + 1, col - 1]
                        return pos
                    }
                } else if (i == row + 1 && j == col - 1) {
                    if (boardData[row - 2][col + 2] == 0) {
                        pos = [row - 2, col + 2]
                        return pos
                    } else {
                        pos = [row + 2, col - 2]
                        return pos
                    }
                } else if (i == row + 2 && j == col - 2) {
                    if (boardData[row - 1][col + 1] == 0) {
                        pos = [row - 1, col + 1]
                        return pos
                    } else {
                        pos = [row + 3, col - 3]
                        return pos
                    }
                }
            }
        } else {
            count = 0;
        }
    }


    return false;
}

function AI(row,col,player){
    if(!checkForThreeOnes(boardData,row,col,player)){
        
    }
}


// // 调用函数并打印结果
// const row = /* 设置行数 */;
// const col = /* 设置列数 */;
// const board = /* 设置你的数组 */;
// console.log(checkForFourOnes(board, row, col));

