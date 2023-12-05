import json

def bubble_sort(data):
    n = len(data)

    for i in range(n - 1):
        for j in range(0, n - i - 1):
            if data[j]['score'] < data[j + 1]['score']:
                data[j], data[j + 1] = data[j + 1], data[j]
    return data

def GetUsersInfo():
    # 读取JSON文件
    with open('userData.json', 'r',encoding="utf8") as file:
        data = json.load(file)
    data=bubble_sort(data)
    return data
# print(data[0])