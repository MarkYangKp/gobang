from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
from checkLine import check_win
import time
import json
from flask_cors import CORS  # Import the CORS module

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app)  # Enable CORS for all routes

socketio = SocketIO(app, cors_allowed_origins='*')

class Room:
    def __init__(self, roomID, player1, player2, moves):
        self.roomID = roomID
        self.player1 = player1
        self.player2 = player2
        self.board = [[0 for _ in range(19)] for _ in range(19)]
        self.moves = []

class RoomList:
    def __init__(self):
        # 初始化房间列表，头部节点为None
        self.head = None

    def add_room(self, roomID, player1, player2):
        # 创建一个新的房间对象
        new_room = Room(roomID, player1, player2)
        if self.head is None:
            # 如果列表为空，将新房间设置为头部节点
            self.head = new_room
        else:
            current = self.head
            while current.next is not None:
                # 遍历列表，找到最后一个节点
                current = current.next
            # 将新房间连接到最后一个节点的后面
            current.next = new_room

    def get_room(self, roomID):
        current = self.head
        while current is not None:
            # 遍历列表，查找具有特定房间ID的房间
            if current.roomID == roomID:
                return current  # 如果找到匹配的房间，则返回该房间对象
            current = current.next
        return None  # 如果未找到匹配的房间，则返回None
    

    def delete_room(roomID):
        current = rooms.head
        prev = None
        while current is not None:
            if current.roomID == roomID:
                # 保存对局信息到chessManual.json文件
                data = {
                    'roomID': current.roomID,
                    'player1': current.player1,
                    'player2': current.player2,
                    'moves': current.moves,
                    'time': time.localtime()
                }
                with open('chessManual.json', 'a') as file:
                    json.dump(data, file, indent=4)
                    file.write('\n')
                # 删除节点
                if prev is None:
                    # 如果要删除的房间是头部节点，更新头部节点为下一个节点
                    rooms.head = current.next
                else:
                    # 将前一个节点的next指针连接到被删除节点的next指针上，绕过被删除节点
                    prev.next = current.next
                break
            prev = current
            current = current.next



rooms = RoomList() #房间链表，每个节点存一个房间，游戏结束删除节点

#进房间列表
@app.route("/roomList")
def showRoomList():
   return render_template("roomList.html") 
#进入
@app.route("/gamePvP")
def gamePvP():
    return render_template("gamePvP.html")
@app.route("/")
def index():
    return render_template("index.html")
@socketio.on('newRoom')
def newRoom(data):
    player1 = data['userID']
    player2 = ''
    roomID = str(random.randint(100000, 999999))  # 生成六位随机数字作为房间ID
    rooms.add_room(roomID,player1,player2)
    emit('room_created', {'player1':player1,'player2':player2,'room':roomID,'state':'wait'}, broadcast=True)

@socketio.on('joinRoom')
def joinRoom(data):
    # player2 = data['userID']
    # roomID = data['roomID']
    # current = rooms.get_room(roomID)
    # if current is not None:
    #     current.player2 = player2
    #     player1 = current.player1
    #     emit('game_start',{'player1':player1,'player2':player2,'room':roomID,'state':'start'},bordcast=True)
    # else:
    #     emit('Error! Can not find the room!')
    print("helloworld")
@socketio.on('message')
def handle_message(message):
    print('Received message:', message)
    socketio.emit('response', {'data': 'Server response'})
@socketio.on('roomList')
def roomList():
    room_data = []
    current = rooms.head
    while current is not None:
        room_data.append({
            'roomID': current.roomID,
            'player1': current.player1,
            'player2': current.player2,
        })
        current = current.next
    emit('room_list',roomList=room_data)



@socketio.on('fallChess')
def fallChess(data):
    x = data['x']
    y = data['y']
    roomID = data['roomID']
    userID = data['userID']
    current = rooms.get_room(roomID)
    if current is not None:
        #判断落子的是哪个玩家，区分黑白子
        if current.player1 == userID:
            current.board[x][y] = 1
            current.moves.append((x,y,1))#将每一步棋都存在房间链表中
        elif current.player2 == userID:
            current.board[x][y] = 2
            current.moves.append((x,y,2))
        else:
            # 用户ID不匹配，无法落子
            return
        #判断连线
        if check_win(current.board,x,y):
            #处理胜利事件
            if check_win(current.board,x,y) == 1:
                # 销毁当前房间
                rooms.delete_room(current.roomID)
                emit('player1_win!',{'state':'win','winner':current.player1,'roomID':current.roomID})
            elif check_win(current.board,x,y) == 2:
                rooms.delete_room(current.roomID)
                emit('player2_win!',{'state':'win','winner':current.player2,'roomID':current.roomID})
        else:
            # 正常落子
            emit('chess_fallen', {'x': x, 'y': y, 'room': roomID, 'userID': userID})
    else:
        emit('Error! Can not find the room!')


@socketio.on('undoMove')
def undoMove(data):
    roomID = data['roomID']
    userID = data['userID']
    current = rooms.get_room(roomID)
    
    if current is not None:
        # 判断当前用户是否是房间的玩家之一
        if current.player1 == userID or current.player2 == userID:
            # 判断是否有可悔棋的步骤
            if len(current.moves) > 2:
                # pop第一次，去掉对手刚才下的一步
                last_move = current.moves.pop()
                # 恢复棋盘第一次
                x, y, player = last_move
                current.board[x][y] = 0
                # pop第二次，去掉自己下的那一步
                last_mova = current.moves.pop()
                # 恢复棋盘状态第二次
                x, y, player = last_move
                current.board[x][y] = 0
                # 发送悔棋事件
                emit('undo_move', { 'room': roomID, 'userID': userID},boradcast=True)
            else:
                # 没有可悔棋的步骤
                emit('Error! No moves to undo!',room=current.roomID)
        else:
            # 用户ID不匹配，无法悔棋
            emit('Error! Invalid user!', room=current.roomID)
    else:
        emit('Error! Can not find the room!')



@socketio.on('leaveRoom')
def on_leave(data):
    username = data['username']
    roomID = data['roomID']
    leave_room(roomID)
    rooms[roomID]['players'] -= 1
    emit('left', {'username': username}, room=roomID)

if __name__ == '__main__':
    socketio.run(app)
