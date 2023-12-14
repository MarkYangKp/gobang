const www = 'http://115.159.211.13:5000'
const LocalUrl = "http://127.0.0.1:5000"
const LocalServer1 = "http://10.1.1.99:5000"
const LocalServer = LocalUrl
document.addEventListener('DOMContentLoaded', function () {
    const userName = IsSetName()
    if (userName) {
        document.getElementById("userNameSpan").innerText = userName
    } else {
        document.getElementById("userNameSpan").innerText = "无名小卒"
    }
    document.getElementById("SetNameButton").addEventListener("click", SetName)
    document.getElementById("SetName-exit").addEventListener("click", HiedSetNameBox)
    GetRankData()
    //join us
    console.log("************************************************************");
    console.log("*  ****  ******  ****  ****    **        **   **   *******  *");
    console.log("*   **   **  **   **   ** **   **        **   **   **       ");
    console.log("*   **   **  **   **   **  **  **        **   **   *******  *");
    console.log("*   **   **  **   **   **   ** **        **   **        **  *");
    console.log("* ****   ******  ****  **    ****        *******   *******  *");
    console.log("************************************************************");
    console.log("Email: markyangkp@outlook.com")



})

// const outils = require("./outils.min.js")
var userID = undefined
function modelCheck(e) {
    if (IsSetName()) {
        console.log(e);
        var model = e.target.dataset.model;
        console.log(model);
        // var OS = outils.getOS()
        // console.log(OS)
        if (model == "pvp") {
            window.location.href = "roomList?userID=" + userID;
        } else if (model == "pve") {
            window.location.href = "gamePvE?userID=" + userID;
        }
    } else {
        showSetNameBox()
    }


    //qdqwdqd
}

function SetUserID() {
    // 生成一个6位的随机数
    const userID = Math.floor(100000 + Math.random() * 900000);
    // 存储用户ID到localStorage
    localStorage.setItem('user_id', userID);
    return userID
}

//是否设置昵称
function IsSetName() {
    // 从localStorage获取用户name
    var userName = localStorage.getItem('user_name');
    if (userName == undefined || userName == null || userName == "") {
        return false
    } else {
        return userName
    }
}

function showSetNameBox() {
    document.getElementById("SetNameBox").style.display = "flex"
    document.getElementById("overlay").style.display = "block"
}
function HiedSetNameBox() {
    document.getElementById("SetNameBox").style.display = "none"
    document.getElementById("overlay").style.display = "none"
}
function SetName(e) {
    var inputBox = document.getElementById("inputBox")

    if (inputBox.value == "") {
        inputBox.placeholder = "请输入昵称"
    } else {
        var userName = inputBox.value
        localStorage.setItem('user_name', userName);
        // 定义请求的URL

        const url = LocalServer + '/setusername';

        // 构建要发送的数据
        const data = {
            userID: String(userID),
            userName: userName
        };

        // 发起POST请求
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 根据实际情况设置请求头
            },
            body: JSON.stringify(data) // 将数据转换为JSON字符串
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // 处理响应数据
                console.log(data);
                if (data.code == 1) {
                    document.getElementById("userNameSpan").innerText = userName
                    HiedSetNameBox()
                    window.location.href = "/"
                }
            })
            .catch(error => {
                // 处理错误
                console.error('There has been a problem with your fetch operation:', error);
            });

        inputBox.value = ""
    }
}
function GetRankData() {
    // 从localStorage获取用户ID
    var userID = localStorage.getItem('user_id');
    var userName = localStorage.getItem('user_name');
    console.log(userName)
    if (userName == null || userName == undefined) {

    } else {
        // 定义请求的URL
        const url = LocalServer + '/GetRank';
        // 构建要发送的数据
        const data = {
            userID: String(userID),
            userName: userName
        };

        // 发起POST请求
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 根据实际情况设置请求头
            },
            body: JSON.stringify(data) // 将数据转换为JSON字符串
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // 处理响应数据
                console.log(data);
                if(data.code == -1){
                    errorUserName()
                }else{
                    CreatRankInfoBox(data.rank, data.userName, data.win, data.fail, data.peace, data.score)
                }
                
                // if (data.code == 1) {
                //     document.getElementById("userNameSpan").innerText = userName
                //     HiedSetNameBox()
                //     window.location.href = "/"
                // }
            })
            .catch(error => {
                // 处理错误
                console.error('There has been a problem with your fetch operation:', error);
            });

    }
}
function CreatRankInfoBox(rank, username, win, fail, peace, score) {
    // < div class="userInfo" >
    //     <div class="rankBox">
    //         <div class="rankBox-item"><span></span></div>
    //         <div class="rankBox-item"><span></span></div>
    //         <div class="rankBox-item">
    //             <span></span>/<span></span>/<span></span></div>
    //         <div class="rankBox-item"><span></span></div>
    //     </div>
    // </div >
    var rankBoxitem1 = document.createElement("div")
    rankBoxitem1.innerHTML = "<span>" + rank + "</span>"
    rankBoxitem1.classList.add("rankBox-item")
    var rankBoxitem2 = document.createElement("div")
    rankBoxitem2.classList.add("rankBox-item")
    rankBoxitem2.innerHTML = "<span>" + username + "</span>"
    var rankBoxitem3 = document.createElement("div")
    rankBoxitem3.classList.add("rankBox-item")
    rankBoxitem3.innerHTML = "<span>" + win + "</span>/<span>" + fail + "</span>/<span>" + peace + "</span>"
    var rankBoxitem4 = document.createElement("div")
    rankBoxitem4.classList.add("rankBox-item")
    rankBoxitem4.innerHTML = "<span>" + score + "</span>"

    var rankBox = document.createElement("div")
    rankBox.classList.add("rankBox")
    rankBox.appendChild(rankBoxitem1)
    rankBox.appendChild(rankBoxitem2)
    rankBox.appendChild(rankBoxitem3)
    rankBox.appendChild(rankBoxitem4)

    var userInfo = document.createElement("div")
    userInfo.classList.add("userInfo")
    userInfo.appendChild(rankBox)
    document.getElementById("rankBox").appendChild(userInfo)
}
function GetUserID() {
    // 从localStorage获取用户ID
    userID = localStorage.getItem('user_id');
    if (userID == null) {
        userID = SetUserID()
    }
}

function errorUserName() {
    var userName = localStorage.getItem("user_name")
    
    const url = LocalServer + '/setusername';

    // 构建要发送的数据
    const data = {
        userID: String(userID),
        userName: userName
    };

    // 发起POST请求
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // 根据实际情况设置请求头
        },
        body: JSON.stringify(data) // 将数据转换为JSON字符串
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 处理响应数据
            console.log(data);
            if (data.code == 1) {
                // document.getElementById("userNameSpan").innerText = userName
                // HiedSetNameBox()
                window.location.href = "/"
            }
        })
        .catch(error => {
            // 处理错误
            console.error('There has been a problem with your fetch operation:', error);
        });
}
GetUserID()