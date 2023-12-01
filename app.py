from flask import Flask, render_template
from flask_socketio import SocketIO, emit,join_room,leave_room
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

Base = declarative_base()

# Define the SQLAlchemy model
class Room(Base):
    __tablename__ = 'roomList'
    player1 = Column(String(255))
    player2 = Column(String(255))
    roomID = Column(String(6),primary_key=True)

# Connect to the MySQL database using SQLAlchemy
engine = create_engine('mysql+pymysql://root:www123...@115.159.211.13/GoBang')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

socketio = SocketIO(app, cors_allowed_origins='*')

@app.route("/")
def index():
    return render_template("index.html")
#进房间列表
@app.route("/roomList")
def showRoomList():
   return render_template("roomList.html") 

#进入
@app.route("/gamePvP")
def gamePvP():
    return render_template("gamePvP.html")

# ... (other routes remain unchanged)

@socketio.on('newRoom')
def newRoom(data):
    player1 = data['userID']
    player2 = ''
    roomID = str(random.randint(100000, 999999))
    
    # Create a new Room object and add it to the database
    new_room = Room(player1=player1, player2=player2, roomID=roomID)
    session.add(new_room)
    session.commit()
    
    emit('room_created', {'player1': player1, 'player2': player2, 'roomID': roomID, 'state': 0},broadcast=True)

@socketio.on('roomList')
def roomList():
    room_data = []
    
    # Retrieve room data from the database
    rooms = session.query(Room).all()
    
    for room in rooms:
        room_data.append({'player1': room.player1, 'player2': room.player2, 'roomID': room.roomID})
    
    emit('room_list', room_data)

@socketio.on('joinRoom')
def joinRoom(data):
    player = data['userID'] # 请求加入房间者的userID
    roomID = data['roomID'] # 请求加入的房间号
    room = session.query(Room).filter_by(roomID=roomID).first()
    if room:
        join_room(roomID)
        room.player2 == player
        session.commit()
        emit('joinRoom_success', {'player1': room.player1, 'player2': player, 'room': roomID, 'state': 1}, broadcast=True)
    else:
        emit('Error! Can not find the room!')

# @socketio.on('startGame')
# def startGame(data):
#     roomID = data['roomID']
#     emit('startGame', room=roomID)

@socketio.on('fallChess')
def fallChess(data):
    roomID = data['roomID']
    col = data['col']
    row = data['row']
    player = data['palyer']
    emit('fallChess_success', {'col': col, 'row': row, 'player': player}, room=roomID)
    #可以加一个存储棋步到数据库的操作


@socketio.on('repentance')
def repentance(data):
    roomID = data['roomID']
    emit('repentance_success', room=roomID)


if __name__ == '__main__':
    socketio.run(app)
