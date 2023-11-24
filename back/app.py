from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
from checkLine import check_win

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app)

class Room:
    def __init__(self, roomID, player1, player2):
        self.roomID = roomID
        self.player1 = player1
        self.player2 = player2
        self.board = [[0 for _ in range(15)] for _ in range(15)]

class RoomList:
    def __init__(self):
        self.head = None

    def add_room(self, roomID, player1, player2):
        new_room = Room(roomID, player1, player2)
        if self.head is None:
            self.head = new_room
        else:
            current = self.head
            while current.next is not None:
                current = current.next
            current.next = new_room

    def get_room(self, roomID):
        current = self.head
        while current is not None:
            if current.roomID == roomID:
                return current
            current = current.next
        return None

rooms = RoomList()

@socketio.on('newRoom')

def newRoom(data):
    player1 = data['userID']
    player2 = ''
    roomID = str(random.randint(100000, 999999))  # 生成六位随机数字作为房间ID
    rooms.add_room(roomID,player1,player2)
    emit('room_created', {'player1':player1,'player2':player2,'room':roomID,'state':'wait'}, broadcast=True)

@socketio.on('joinRoom')
def joinRoom(data):
    player2 = data['userID']
    roomID = data['roomID']
    current = rooms.get_room(roomID)
    if current is not None:
        current.player2 = player2
        player1 = current.player1
        emit('game start',{'player1':player1,'player2':player2,'room':roomID,'state':'start'},bordcast=True)
    else:
        emit('Error! Can not find the room!')
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
        elif current.player2 == userID:
            current.board[x][y] = 2
        else:
            # 用户ID不匹配，无法落子
            return
        if check_win(current.borad,x,y):
            #处理胜利事件
            emit()
        else:
            emit('chess_fallen', {'x': x, 'y': y, 'room': roomID, 'userID': userID}, broadcast=True)
    else:
        emit('Error! Can not find the room!')

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    roomID = data['roomID']
    leave_room(roomID)
    rooms[roomID]['players'] -= 1
    emit('left', {'username': username}, room=roomID)

if __name__ == '__main__':
    socketio.run(app)
