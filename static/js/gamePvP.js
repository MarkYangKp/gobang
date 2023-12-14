
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

    } else if (player == 2) {

        boardData[row][col] = 2

    }
    var data = {
        roomID: roomID,
        player: player,
        row: row,
        col: col,
    }
    socketio.emit("fallChess", data)

    isPlay = 0

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
            document.getElementById("Player2").classList.remove("play")
            document.getElementById("Player2").classList.add("await")
        } else {
            document.getElementById("Player1").classList.remove("play")
            document.getElementById("Player1").classList.add("await")
            document.getElementById("Player2").classList.remove("await")
            document.getElementById("Player2").classList.add("play")
        }
    } else if (player == 2) {
        if (isPlay == 1) {
            document.getElementById("Player2").classList.remove("await")
            document.getElementById("Player2").classList.add("play")
            document.getElementById("Player1").classList.remove("play")
            document.getElementById("Player1").classList.add("await")
        } else {
            document.getElementById("Player2").classList.remove("play")
            document.getElementById("Player2").classList.add("await")
            document.getElementById("Player1").classList.remove("await")
            document.getElementById("Player1").classList.add("play")
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
    userID = localStorage.getItem('user_id');
    userName = localStorage.getItem('user_name');

    console.log("roomID:" + roomID + "  userName:" + userName)

    data = {
        roomID: roomID,
        userID: userID,
        userName: userName
    }
    const BackUrl = 'http://115.159.211.13:5000'
    const LocalUrl = "http://127.0.0.1:5000"
    const LocalServer = "http://10.1.1.99:5000"
    // BackUrl LocalUrl
    socketio = io(BackUrl);
    socketio.emit("joinRoom", data)

    socketio.on("joinRoom_success" + roomID, (res) => {
        console.log(res)
        if (userID == res.player1) {
            player = 1
            document.getElementById("palyer1name").innerText = res.userNames[0]
            document.getElementById("palyer2name").innerText = res.userNames[1]
        } else if (userID = res.player2) {
            player = 2
            document.getElementById("palyer1name").innerText = res.userNames[0]
            document.getElementById("palyer2name").innerText = res.userNames[1]
        }
        console.log(player)
        if (res.state == 1) {
            isStart = true
            RenderBoard()
            if (player == 1) {
                isPlay = 1
            }
            StatusChecking()
            console.log("isPlay:" + isPlay)
            socketio.on("fallChess_success" + roomID, res1 => {
                console.log(res1.shareData)
                var row = res1.row;
                var col = res1.col;

                var playerType = res1.player
                if (playerType == 1 && player == 2) {
                    isPlay = 1;
                } else if (playerType == 2 && player == 1) {
                    isPlay = 1;
                } else if (playerType == 1 && player == 1) {
                    isPlay = 0;
                } else if (playerType == 2 && player == 2) {
                    isPlay = 0;
                }
                console.log("fallChess_success isPlay" + isPlay)
                StatusChecking();
                boardData[row][col] = playerType
                RenderBoard();
                PlayMusic("failChess")
                chessManual = {
                    "userType": playerType,
                    "pos": {
                        "x": col, "y": row  //x,y坐标和行列是相反的
                    }
                }

                chessManuals.push(chessManual)

                var sendData = {
                    row: row,
                    col: col,
                    player: player,
                    roomID: roomID,
                    board_data: boardData,
                }
                socketio.emit("checkWin", sendData)
                socketio.on("Win" + roomID, res2 => {
                    if (res2.winer == player) {
                        PlayMusic("winGame")
                        document.getElementById("boardPad").innerHTML = ""
                        document.getElementById("boardPad").appendChild(CreateAgainBox("恭喜你取得胜利", isAgain))

                        SubscriptAgain()
                    } else {
                        PlayMusic("failedGame")
                        document.getElementById("boardPad").innerHTML = ""
                        document.getElementById("boardPad").appendChild(CreateAgainBox("很遗憾你输了", isAgain))
                        SubscriptAgain()
                    }
                })
            })
            IsRepentance()
            SubscriptPeace()
            SubscriptAdmitDefeat()
            ClientReceiveMsg()
            ShowUserList()
        } else {
            isStart = false
            document.getElementById('boardPad').innerHTML = "<h1>等待中，未开始</h1>";
        }


    })
});

function ShowUserList() {
    socketio.on("userList" + roomID, res => {
        document.getElementById("palyer1name").innerText = res.userNames[0]
        document.getElementById("palyer2name").innerText = res.userNames[1]
    })
}

//生成再来一局提示框
function CreateAgainBox(contentText) {
    function eventHandler(event) {
        functionSel(event);
    }
    // 创建新的div元素
    var againBoxDiv = document.createElement('div');

    // 设置div的class和id属性
    againBoxDiv.className = 'AgainBox';
    againBoxDiv.id = 'AgainBox';

    // 创建内部的子元素并设置其内容
    var innerDiv1 = document.createElement('div');
    var h1Element = document.createElement('h1');
    h1Element.textContent = contentText;
    innerDiv1.appendChild(h1Element);

    var innerDiv2 = document.createElement('div');
    innerDiv2.className = 'msg';
    innerDiv2.id = "msg"
    var spanElement = document.createElement('span');
    spanElement.className = 'msgContent';
    spanElement.textContent = '是否再来一局';

    innerDiv2.appendChild(spanElement);

    var msgActionDiv = document.createElement('div');
    msgActionDiv.className = 'msgAction';

    var msgBut1 = document.createElement('div');
    msgBut1.className = 'msgBut';
    msgBut1.innerText = "是"
    msgBut1.dataset.isagain = "1"
    msgBut1.addEventListener('click', isAgain)
    // msgBut1.onclick = isAgain

    var msgBut2 = document.createElement('div');
    msgBut2.className = 'msgBut';
    msgBut2.innerText = "否"
    msgBut2.dataset.isagain = "0"
    msgBut2.addEventListener('click', isAgain)
    // msgBut2.onclick = isAgain
    msgActionDiv.appendChild(msgBut1);
    msgActionDiv.appendChild(msgBut2);

    innerDiv2.appendChild(msgActionDiv);

    againBoxDiv.appendChild(innerDiv1);
    againBoxDiv.appendChild(innerDiv2);

    return againBoxDiv
}

//生成提示框
function CreateMessageBox(contentText, isShowBut, defFunction) {

    var main = document.getElementById("main")
    var messageBox = document.createElement("div")
    messageBox.classList.add("messageBox")
    messageBox.setAttribute("id", "messageBox")
    var msgTitle = document.createElement("div")
    msgTitle.classList.add("msgTitle")
    msgTitle.innerHTML = "<h2>提示</h2>"

    var msg = document.createElement("div")
    msg.classList.add("msg")
    var msgContent = document.createElement("span")
    msgContent.classList.add("msgContent")
    msgContent.innerText = contentText
    msg.appendChild(msgContent)

    var msgAction = document.createElement("div")
    msgAction.classList.add("msgAction")

    var msgBut1 = document.createElement("div")
    msgBut1.classList.add("msgBut")
    msgBut1.innerText = "是"
    msgBut1.dataset.isaccept = "1"
    msgBut1.addEventListener("click", defFunction)
    // msgBut1.onclick = defFunction
    var msgBut2 = document.createElement("div")
    msgBut2.classList.add("msgBut")
    msgBut2.innerText = "否"
    msgBut2.dataset.isaccept = "0"
    msgBut2.addEventListener("click", defFunction)
    // msgBut2.onclick = defFunction
    msgAction.appendChild(msgBut1)
    msgAction.appendChild(msgBut2)

    messageBox.appendChild(msgTitle)
    messageBox.appendChild(msg)
    if (isShowBut) {
        messageBox.appendChild(msgAction)
    }

    main.appendChild(messageBox)
}
//生成求和提示框
function CreatePeaceMessageBox(contentText, isShowBut) {

    var main = document.getElementById("main")
    var messageBox = document.createElement("div")
    messageBox.classList.add("messageBox")
    messageBox.setAttribute("id", "messageBox")
    var msgTitle = document.createElement("div")
    msgTitle.classList.add("msgTitle")
    msgTitle.innerHTML = "<h2>提示</h2>"

    var msg = document.createElement("div")
    msg.classList.add("msg")
    var msgContent = document.createElement("span")
    msgContent.classList.add("msgContent")
    msgContent.innerText = contentText
    msg.appendChild(msgContent)

    var msgAction = document.createElement("div")
    msgAction.classList.add("msgAction")

    var msgBut1 = document.createElement("div")
    msgBut1.classList.add("msgBut")
    msgBut1.innerText = "是"
    msgBut1.dataset.isaccept = "1"
    msgBut1.addEventListener("click", IsPeace)
    // msgBut1.onclick = IsPeace
    var msgBut2 = document.createElement("div")
    msgBut2.classList.add("msgBut")
    msgBut2.innerText = "否"
    msgBut2.dataset.isaccept = "0"
    msgBut2.addEventListener("click", IsPeace)
    // msgBut2.onclick = IsPeace
    msgAction.appendChild(msgBut1)
    msgAction.appendChild(msgBut2)

    messageBox.appendChild(msgTitle)
    messageBox.appendChild(msg)
    if (isShowBut) {
        messageBox.appendChild(msgAction)
    }

    main.appendChild(messageBox)
}

function repentance() {
    if (isPlay) {
        var data = {
            roomID: roomID,
            player: player,
            // boardData:boardData,
        }
        socketio.emit("repentance", data)
    } else {
        console.log("当前不可以悔棋")
    }
}
//订阅悔棋
function IsRepentance() {
    socketio.on("IsRepentance" + roomID, res => {
        if (player != res.player) {
            console.log("对方请求悔棋，您是否同意")
            CreateMessageBox("对方请求悔棋，您是否同意", true, AcceptRepentance)
            socketio.on("RepentanceResult" + roomID, res1 => {
                if (res1.result == 1) { //同意悔棋
                    RetractChess()
                    document.getElementById("messageBox").remove();
                } else { //不同意悔棋
                    RenderBoard()
                    document.getElementById("messageBox").remove();
                }

                socketio.off("RepentanceResult" + roomID)
            })
        } else {
            console.log("正在等待对方回应，请稍后")
            CreateMessageBox("正在等待对方回应，请稍后", false, AcceptRepentance)
            socketio.on("RepentanceResult" + roomID, res2 => {
                if (res2.result == 1) { //同意悔棋
                    RetractChess()
                    document.getElementById("messageBox").remove();
                } else { //不同意悔棋
                    RenderBoard()
                    document.getElementById("messageBox").remove();
                }

                socketio.off("RepentanceResult" + roomID)
            })
        }
    })
}
//是否同意悔棋
function AcceptRepentance(e) {

    var isAccept = e.target.dataset.isaccept
    console.log(isAccept)
    var data = {
        roomID: roomID,
        player: player,
        isAccept: isAccept
    }
    socketio.emit("AcceptRepentance", data)

}
//是否同意重新开局
function isAgain(e) {

    var isAgain = e.target.dataset.isagain;
    console.log(isAgain)
    var data = {
        roomID,
        userID,
        isAgain
    }

    socketio.emit("AgainGame", data)

    document.getElementById("msg").innerText = "正在等待对方回应"

}
//订阅是否重新开局
function SubscriptAgain() {
    socketio.on("AgainGame" + roomID, res => {
        if (res.againGame) {
            InitBoard()
            RenderBoard()
            // socketio.off("AgainGame" + roomID)
        }
    })
}
//求和
function peace() {
    var data = {
        roomID: roomID,
        player: player,
        // boardData:boardData,
    }
    socketio.emit("Peace", data)
}
//确认是否平局
function IsPeace(e) {

    var isAccept = e.target.dataset.isaccept
    console.log(isAccept)
    var data = {
        roomID: roomID,
        player: player,
        isAccept: isAccept
    }
    socketio.emit("AcceptPeace", data)

}
//订阅求和事件
function SubscriptPeace() {
    socketio.on("Peace" + roomID, res => {
        if (player != res.player) {
            console.log("对方向你求和，你是否同意")
            CreatePeaceMessageBox("对方向你求和，你是否同意", true)
            socketio.on("AcceptPeace" + roomID, res1 => {
                if (res1.result == 1) { //同意求和
                    document.getElementById("messageBox").remove();
                    document.getElementById("boardPad").innerHTML = ""
                    document.getElementById("boardPad").appendChild(CreateAgainBox("平局", isAgain));
                    SubscriptAgain()
                } else { //不同意求和
                    RenderBoard()
                    document.getElementById("messageBox").remove();
                }

                socketio.off("AcceptPeace" + roomID)
            })
        } else {
            console.log("正在等待对方回应，请稍后")
            CreatePeaceMessageBox("正在等待对方回应，请稍后", false)
            socketio.on("AcceptPeace" + roomID, res2 => {
                if (res2.result == 1) { //同意求和
                    document.getElementById("messageBox").remove();
                    document.getElementById("boardPad").innerHTML = ""
                    document.getElementById("boardPad").appendChild(CreateAgainBox("平局", isAgain));
                    SubscriptAgain()
                } else { //不同意求和
                    RenderBoard()
                    document.getElementById("messageBox").remove();
                }

                socketio.off("AcceptPeace" + roomID)
            })
        }
    })
}
//认输
function admitDefeat() {
    var data = {
        roomID,
        player,
    }
    socketio.emit("AdmitDefeat", data)
}
//订阅认输
function SubscriptAdmitDefeat() {
    socketio.on("AdmitDefeat" + roomID, res => {
        if (res.player != player) {
            PlayMusic("winGame")
            document.getElementById("boardPad").innerHTML = ""
            document.getElementById("boardPad").appendChild(CreateAgainBox("对方认输，恭喜你取得胜利"), isAgain)

            SubscriptAgain()
        } else {
            PlayMusic("failedGame")
            document.getElementById("boardPad").innerHTML = ""
            document.getElementById("boardPad").appendChild(CreateAgainBox("你认输了，很遗憾你输了"), isAgain)
            SubscriptAgain()
        }

        // socketio.off("AdmitDefeat" + roomID)
    })
}

function addClick() {
    // const index = document.getElementById("indexPage")
    // index.addEventListener("click", function () {
    //     window.location.href = "/";
    // })
    // document.getElementById("roomListPage").addEventListener("click", function () {
    //     window.location.href = "/roomList";
    // })
    document.getElementById("repentance").addEventListener("click", repentance)
    document.getElementById("peace").addEventListener("click", peace)
    document.getElementById("admitDefeat").addEventListener("click", admitDefeat)
    document.getElementById("exitRoom").addEventListener("click", exitRoom)
    document.getElementById("sendBut").addEventListener("click", sendMessage)
}

function exitRoom() {
    CreateMessageBox("您是否要退出房间！", true, isExitRoom)
}
//是否同意重新开局
function isExitRoom(e) {

    var isExitRoom = e.target.dataset.isaccept;
    if (isExitRoom == "1") {
        var data = {
            roomID: roomID,
            userID: userID
        }
        console.log("111")

        socketio.emit("leaveRoom", data)
        window.location.href = "/roomList?userID=" + userID
    } else {
        document.getElementById("messageBox").remove()
    }


}

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

// 聊天弹幕
function sendMessage() {
    var text = document.getElementById("input").value

    data = {
        roomID: roomID,
        userName: userName,
        msg: text
    }

    socketio.emit("message", data)

    document.getElementById("input").value = ""
}
function ClientReceiveMsg() {

    socketio.on("ClientReceiveMsg" + roomID, res => {
        console.log(res)
        if (res.code == 1) {
            msg = res.msg
            var subtitleBox = document.createElement("div")
            subtitleBox.classList.add("subtitle")
            subtitleBox.innerHTML = "<span>" + msg + "</span>"
            subtitleBox.addEventListener('animationend', function (e) {
                e.target.remove();
            });
            document.getElementById("main").appendChild(subtitleBox)

            var chatLog = document.getElementById("chatLog")

            var chat_username = document.createElement("div")
            chat_username.classList.add("chat_username")
            chat_username.innerText = res.userName + ":"
            var chat_content = document.createElement("div")
            chat_content.classList.add("chat_content")
            chat_content.innerText = msg
            var oneChat = document.createElement("div")
            oneChat.classList.add("oneChat")
            oneChat.appendChild(chat_username)
            oneChat.appendChild(chat_content)

            chatLog.appendChild(oneChat)
        }

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
