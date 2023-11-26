// const outils = require("./outils.min.js")
function modelCheck(e) {
    console.log(e);
    var model = e.target.dataset.model;
    console.log(model);
    var userID = "123"
    // var OS = outils.getOS()
    // console.log(OS)
    if(model == "pvp"){
        window.location.href = "roomList?userID="+userID;
    }else if(model == "pve"){
        window.location.href = "gamePvE?userID="+userID; 
    }
}