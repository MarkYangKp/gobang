function joinRoom(e){
    var roomId = e.target.dataset.roomId

    window.location.href = "./gamePvP?roomid="+roomId;
}
let socket = null
function onLoad(){
    socket = io('http://127.0.0.1:5000/');
    socket.on("connect",(res)=>{
        console.log("连接成功")
    })
    //进入房间列表页面之后，先获取所有的房间
    socket.emit('roomList')
    socket.on('roomList',(res)=>{
        console.log(res)
    })
    
}
function createRoom(){
    socket.emit("newRoom")
    socket.on("room_created",(res)=>{
        console.log(res)
        console.log('1')
        // window.location.href = "./gamePvP?roomID="+res.roomID;
    })
}
onLoad()