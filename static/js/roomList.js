function joinRoom(e){
    var roomId = e.target.dataset.roomId

    window.location.href = "./gamePvP?roomid="+roomId;
}
let socket = null
function onLoad(){
    socket = io('http://127.0.0.1:5000/');
    socket.on("connect",(res)=>{
        console.log("连接成功")
        console.log(res)
    })

}
function createRoom(){
    data = {
        "userID":"123"
    }
    socket.emit("newRoom",data)
    socket.on("room_created",(res)=>{
        console.log(res)
    })
}
onLoad()