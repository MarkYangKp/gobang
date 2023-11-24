function joinRoom(e){
    var roomId = e.target.dataset.roomId

    window.location.href = "./gamePvP.html?roomid="+roomId;
}
