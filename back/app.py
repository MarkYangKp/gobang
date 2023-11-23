from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app)

# 你可以定义房间字典来存储当前的房间状态
rooms = {}

@socketio.on('newRoom')

def newRoom(data):
    userID = data['userID']
    roomID = str(random.randint(100000, 999999))  # 生成六位随机数字作为房间ID
    rooms[roomID] = {
    'players': 1,
    'player1':userID,
    'player2':'',
    'room_id':roomID,
    'board': [[0 for _ in range(15)] for _ in range(15)]
    }
    emit('room_created', {'room_id': roomID}, broadcast=True)

@socketio.on('joinRoom')
def on_join(data):
    username = data['username']
    room_id = data['room_id']
    if rooms.get(room_id) and rooms[room_id]['players'] < 2:
        join_room(room_id)
        rooms[room_id]['players'] += 1
        emit('joined', {'username': username}, room=room_id)
    else:
        emit('full_room', room=room_id)

@socketio.on('leaveRoom')
def on_leave(data):
    username = data['username']
    room_id = data['room_id']
    leave_room(room_id)
    rooms[room_id]['players'] -= 1
    emit('left', {'username': username}, room=room_id)

if __name__ == '__main__':
    socketio.run(app)
