// const outils = require("./outils.min.js")
var userID = undefined
function modelCheck(e) {
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

    //qdqwdqd
}

function SetUserID() {
    // 生成一个6位的随机数
    const userID = Math.floor(100000 + Math.random() * 900000);
    // 存储用户ID到localStorage
    localStorage.setItem('user_id', userID);
    return userID
}

function GetUserID()
{
    // 从localStorage获取用户ID
    userID = localStorage.getItem('user_id');
    if(userID==null){
        userID = SetUserID()
    }
}

GetUserID()