import json
import shareData

def bubble_sort(data):
    n = len(data)

    for i in range(n - 1):
        for j in range(0, n - i - 1):
            if data[j]['score'] < data[j + 1]['score']:
                data[j], data[j + 1] = data[j + 1], data[j]
    for i in range(n):
        data[i]['rank'] = i + 1
    with open('userData.json', 'w',encoding="utf8") as file: 
        file.write( json.dumps(data))
    # return data

def GetUsersInfo():
    # 读取JSON文件
    with open('userData.json', 'r',encoding="utf8") as file:
        data = json.load(file)
    # bubble_sort(data)
    return data
# print(data[0])



# 积分制度
# 正常对局，根据棋步，赢的人+len(current.moves)分，输的人-len(current.moves)分
# 和局，两个人各加len(current.moves)/2分
# 认输局，赢的人+len(current.moves)分，输的人-len(current.moves)*2分

def Score(category, player,roomID):
    userData = GetUsersInfo()
    current = shareData.rooms.get_room(roomID)
    if player == 1:
        player = current.player1
    else:
        player = current.player2
    if category == 'AdmitDefeat':
        for user in userData:
            
            if user['userID'] == player:
                user['fail'] += 1
                user['score'] -= len(current.moves)*2
                break
        
        # 另一方，win+1
        if player == current.player1:
            for user in userData:
                
                if user['userID'] == current.player2:
                    user['win'] += 1
                    user['score']+=len(current.moves)
                    break
                
        else:
            for user in userData:
                
                if user['userID'] == current.player1:
                    user['win'] += 1
                    user['score']+=len(current.moves)
                    break


    elif category == 'Peace':
        for user in userData:
            if current.player1 == user['userID'] or current.player2 == user['userID']:
                user['peace'] += 1
                user['score'] += int(len(current.moves)/2)


    elif category =='win':
        for user in userData:
            if player == user['userID']: 
                print('赢！！！')
                user['win'] += 1
                user['score']+=len(current.moves)
                break
        # 另一方fail+1
        if player == current.player1:
            for user in userData:
                if user['userID'] == current.player2:
                    print('输！！！')
                    user['fail'] += 1
                    user['score'] -=len(current.moves)
                    break
        else:
            for user in userData:
                if user['userID'] == current.player1:
                    print('输！！！')
                    user['fail'] += 1
                    user['score'] -=len(current.moves)
                    break  
    bubble_sort(userData) 
