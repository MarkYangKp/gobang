def check_win(player, row, col, board_data):
    
    # 检查水平方向
    count = 0
    for i in range(col - 4, col + 5):
        if 0 <= i < 19 and board_data[row][i] == player:
            count += 1
            if count == 5:
                return True
        else:
            count = 0

    # 检查垂直方向
    count = 0
    for i in range(row - 4, row + 5):
        if 0 <= i < 19 and board_data[i][col] == player:
            count += 1
            if count == 5:
                return True
        else:
            count = 0

    # 检查主对角线
    count = 0
    for i, j in zip(range(row - 4, row + 5), range(col - 4, col + 5)):
        if 0 <= i < 19 and 0 <= j < 19 and board_data[i][j] == player:
            count += 1
            if count == 5:
                return True
        else:
            count = 0

    # 检查副对角线
    count = 0
    for i, j in zip(range(row - 4, row + 5), range(col + 4, col - 5, -1)):
        if 0 <= i < 19 and 0 <= j < 19 and board_data[i][j] == player:
            count += 1
            if count == 5:
                return True
        else:
            count = 0

    return False
