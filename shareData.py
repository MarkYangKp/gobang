import json
import time
class Room:
    def __init__(self, roomID, player1, player2, playerNum, moves, isAgainGame, player1_name, player2_name):
        self.roomID = roomID
        self.player1 = player1
        self.player2 = player2
        self.playerNum = playerNum
        self.isAgainGame = isAgainGame
        self.player1_name = player1_name
        self.player2_name = player2_name
        self.moves = moves
        self.next = None

class RoomList:
    def __init__(self):
        # 初始化房间列表，头部节点为None
        self.head = None

    def add_room(self, roomID, player1, player2 , playerNum, moves, isAgainGame, palyer1_name, player2_name):
        # 创建一个新的房间对象
        new_room = Room(roomID, player1, player2 , playerNum, moves, isAgainGame, palyer1_name, player2_name)
        if self.head is None:
            # 如果列表为空，将新房间设置为头部节点
            print('0')
            self.head = new_room
        else:
            current = self.head
            while current.next is not None:
                # 遍历列表，找到最后一个节点
                current = current.next
            # 将新房间连接到最后一个节点的后面
            print('1')
            current.next = new_room


    def get_room(self, roomID):
        current = self.head
        while current is not None:
            # 遍历列表，查找具有特定房间ID的房间
            if current.roomID == roomID:
                return current  # 如果找到匹配的房间，则返回该房间对象
            current = current.next
        return None  # 如果未找到匹配的房间，则返回None
    

    def delete_room(self,roomID):
        current = self.head
        prev = None
        while current is not None:
            if current.roomID == roomID:
                # 保存对局信息到chessManual.json文件
                data = {
                    'roomID': current.roomID,
                    'player1': current.player1,
                    'player2': current.player2,
                    'moves': current.moves,
                    'time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
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

rooms = RoomList()


data = [
    
]

isAgainGame = {
    # "roomid":[
    #     player1,player2
    # ]
}