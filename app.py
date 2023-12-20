from flask import Flask, render_template,request
from flask_socketio import SocketIO, emit
import random
from checkLine import check_win
import shareData
import json
from appInit import GetUsersInfo
from appInit import Score

from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app) 
socketio = SocketIO(app, cors_allowed_origins='*')




@app.route("/",methods=['GET', 'POST'])
def index():
    data = GetUsersInfo()
    
        
    return render_template("index.html",rankData=data)
@app.route("/GetRank",methods=['GET', 'POST'])
def GetRank():
    data = GetUsersInfo()
    if request.method == "POST":
        postData = request.json
        user = {}
        for item in data:
            if str(postData["userID"]) == str(item["userID"]):
                item["code"] = 1
                return item
        return {
            "code":-1
        }
        

@app.route("/setusername",methods=["POST"])
def SetUserName():
    if request.method == "GET":
        return None
    data = request.json
    print(data)

    try:
        usersInfo = GetUsersInfo()
        userInfo = {
            "userID": data['userID'],
            "win": 0,
            "fail": 0,
            "peace": 0,
            "score": 0,
            "userName": data['userName']
        }
        usersInfo.append(userInfo)
        with open("userData.json", 'w',encoding="utf8") as file:
            file.write(json.dumps(usersInfo))
        return {
            "code":1
        }
    except:
        print("未知错误")
    

@app.route("/roomList")
def showRoomList():
   return render_template("roomList.html") 


@app.route("/gamePvP")
def gamePvP():
    return render_template("gamePvP.html")

@app.route("/gamePvE")
def gamePvE():
    return render_template("gamePvE.html")
@socketio.on('newRoom')
def newRoom(data):  
    player1 = data['userID']
    player2 = ''
    playerNum = ''
    moves=[]
    isAgainGame = []
    player1_name = data['userName']
    player2_name = ''
    roomID = str(random.randint(100000, 999999))
    client_id = request.sid
    print(client_id)
    shareData.clients[client_id] = player1+roomID
    print(shareData.clients)
    shareData.rooms.add_room(roomID,player1,player2,playerNum,moves,isAgainGame,player1_name,player2_name)
    emit('room_created', {'player1': player1_name, 'player2': player2_name, 'roomID': roomID, 'state': 0, "pid1":player1,"pid2":player2},broadcast=True)

def ShowRoomList():
    room_data = []
    userData = GetUsersInfo()
    current = shareData.rooms.head
    while current is not None:
        #根据userID遍历userData，获取userName
        for user in userData:
            if user['userID'] == current.player1:
                current.player1_name = user['userName']
            if user['userID'] == current.player2:
                current.player2_name = user['userName']
        room_data.append({
            'roomID': current.roomID,
            'player1': current.player1_name,
            'player2': current.player2_name
        })
        current = current.next
    return room_data
@socketio.on('roomList')
def roomList():
    room_data = ShowRoomList()
    
    emit('room_list',room_data)


@socketio.on('joinRoom')
def joinRoom(data):
    player = data['userID'] #请求加入房间者的userID
    roomID = data['roomID']
    current = shareData.rooms.get_room(roomID)
    userData = GetUsersInfo()
    if current is not None:
        if current.playerNum == '':
            current.playerNum += '1'
            client_id = request.sid
            shareData.clients[client_id] = player+roomID
            print(shareData.clients)
            # 新建房间时已进行player1的赋值
            # 根据userID获取玩家名字
            for user in userData:
                if user['userID'] == player:
                    current.player1_name = user['userName']
            userNames=[current.player1_name,""]
            emit('joinRoom_success'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
            emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
        elif current.playerNum == '1':
            if player != current.player1:
                client_id = request.sid
                shareData.clients[client_id] = player+roomID
                print(shareData.clients)
                current.player2 = player
                current.playerNum += '1'
                for user in userData:
                    if user['userID'] == player:
                        current.player2_name = user['userName']
                print(current.player1_name,current.player2_name)
                userNames=[current.player1_name,current.player2_name]
                
                
                emit('joinRoom_success'+roomID, {'player1': current.player1, 'player2': player, 'room': roomID, 'state': 1, 'userNames':userNames}, broadcast=True)
                emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
            else:
                for user in userData:
                    if user['userID'] == player:
                        current.player1_name = user['userName']
                userNames=[current.player1_name,""]
                emit('joinRoom_success'+roomID, {'player1': current.player1, 'player2': '', 'room': roomID, 'state': 0,'userNames':userNames}, broadcast=True)
                emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
        else:
            emit('joinRoom_fail', {'room': roomID})
    else:
        print('Cant find the room!'+roomID)


@socketio.on('leaveRoom')
def leaveRoom(data):
    roomID = data['roomID']
    player = data['userID']
    current = shareData.rooms.get_room(roomID)
    if current.playerNum == '11':
        if player == current.player1:
            current.player1 = ''
            current.player1_name = ""
            current.playerNum = '1'
            userNames = ["",current.player2_name]
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
        elif player == current.player2:
            current.player2 = ''
            current.player2_name = ""
            current.playerNum = '1'
            userNames=[current.player1_name,""]
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
    elif current.playerNum == '1':
        if player == current.player1:
            current.player1 = ''
            shareData.rooms.delete_room(roomID)
            print('delete room!')
            room_data = ShowRoomList()
            emit('room_list',room_data, broadcast=True)
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            
        elif player == current.player2:
            current.player2 = ''
            shareData.rooms.delete_room(roomID)
            print('delete room!')
            room_data = ShowRoomList()
            emit('room_list',room_data, broadcast=True)
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)


def leaveRoom(data):
    roomID = data['roomID']
    player = data['userID']
    current = shareData.rooms.get_room(roomID)
    if current.playerNum == '11':
        if player == current.player1:
            current.player1 = ''
            current.player1_name = ""
            current.playerNum = '1'
            userNames = ["",current.player2_name]
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
        elif player == current.player2:
            current.player2 = ''
            current.player2_name = ""
            current.playerNum = '1'
            userNames=[current.player1_name,""]
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            emit('userList'+roomID, {'player1': player, 'player2': '', 'room': roomID, 'state': 0, 'userNames':userNames}, broadcast=True)
    elif current.playerNum == '1':
        if player == current.player1:
            current.player1 = ''
            shareData.rooms.delete_room(roomID)
            print('delete room!')
            room_data = ShowRoomList()
            emit('room_list',room_data, broadcast=True)
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)
            
        elif player == current.player2:
            current.player2 = ''
            shareData.rooms.delete_room(roomID)
            print('delete room!')
            room_data = ShowRoomList()
            emit('room_list',room_data, broadcast=True)
            emit('leaveRoom_success'+roomID, {'room': roomID, 'player': player}, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    cilent_id = request.sid
    print(cilent_id)
    id = shareData.clients.get(cilent_id)
    if id:
        data={
            'roomID':id[6:],
            'userID':id[:6]
        }
        leaveRoom(data)
        print('执行')
    else:
        print('Can not find!')


@socketio.on('fallChess')
def fallChess(data):
    roomID = data['roomID']
    col = data['col']
    row = data['row']
    player = data['player']
    current = shareData.rooms.get_room(roomID)
    current.moves.append([row,col,player])
    emit('fallChess_success'+roomID, {'col': col, 'row': row, 'player': player,'roomID':roomID},broadcast=True)


@socketio.on('checkWin')
def checkWin(data):
    roomID = data['roomID']
    player = data['player']
    board_data = data['board_data']
    current = shareData.rooms.get_room(roomID)
    # print(player,current.moves[-1][0],current.moves[-1][1],board_data)
    if(check_win(player,current.moves[-1][0],current.moves[-1][1],board_data)):
        Score("win",player,roomID)
        emit('Win'+roomID,{'winer':current.moves[-1][2],'roomID':roomID,'status':1},broadcast=True)



#发起悔棋操作
@socketio.on('repentance')
def repentance(data):
    roomID = data['roomID']
    player = data['player']
    emit('IsRepentance'+roomID,{"roomID":roomID,"player":player},broadcast=True)


#悔棋操作结果
@socketio.on('AcceptRepentance')
def AcceptRepentance(data):
    roomID = data['roomID']
    player = data['player']
    isAccept = data['isAccept']
    current = shareData.rooms.get_room(roomID)
    current.moves.pop()
    current.moves.pop()
    if(isAccept == "1"):
        emit("RepentanceResult"+roomID,{"result":1,"moves":current.moves},broadcast=True)
    else:
        emit("RepentanceResult"+roomID,{"result":0},broadcast=True)


#认输
@socketio.on('AdmitDefeat')
def AdmitDefeat(data):
    roomID = data['roomID']
    player = data['player']
    # 积分操作
    Score("AdmitDefeat",player,roomID)
    # 一方认输，fail+1
    # for user in userData:
    #     if user['userID'] == player:
    #         user['fail']+=1
    # current = shareData.rooms.get_room(roomID)
    # # 另一方，win+1
    # if player == current.player1:
    #     for user in userData:
    #         if user['userID'] == current.player2:
    #             user['win']+=1
    #             break
    # else:
    #     for user in userData:
    #         if user['userID'] == current.player1:
    #             user['win']+=1
    #             break
    emit("AdmitDefeat"+roomID,{"player":player},broadcast=True)



#求和
@socketio.on("Peace")
def Peace(data):
    roomID = data['roomID']
    player = data['player']
    emit('Peace'+roomID,{"roomID":roomID,"player":player},broadcast=True)


#确认求和
@socketio.on('AcceptPeace')
def AcceptPeace(data):
    print(data)
    roomID = data['roomID']
    player = data['player']
    isAccept = data['isAccept']
    
    if(isAccept == "1"):
        current = shareData.rooms.get_room(roomID)
        Score("Peace",player,roomID)
        emit("AcceptPeace"+roomID,{"result":1},broadcast=True)
    else:
        emit("AcceptPeace"+roomID,{"result":0},broadcast=True)



#再来一局
@socketio.on('AgainGame')
def AgainGame(data):
    roomID = data['roomID']
    userID = data['userID']
    isAgain = data['isAgain']
    current = shareData.rooms.get_room(roomID)
    print(current.isAgainGame)
    if isAgain == "1":
        if userID not in current.isAgainGame:
            current.isAgainGame.append(userID)

    if len(current.isAgainGame) == 2:
        emit("AgainGame"+roomID,{"againGame":1, "isAgain":isAgain},broadcast=True)
        current.isAgainGame = []
        
    else:
        emit("AgainGame"+roomID,{"againGame":0, "isAgain":isAgain},broadcast=True)

@socketio.on("message")
def ReceiveMessage(data):
    roomID = data["roomID"]
    userName = data["userName"]
    msg = data["msg"]
    
    print(data)
    emit("ClientReceiveMsg"+roomID,{"roomID":roomID,"userName":userName,"msg":msg,"code":1},broadcast=True)

if __name__ == '__main__':
    socketio.run(app,host="0.0.0.0",port=5000)
 