# BEGIN: check_win
def check_win(board, row, col):
    # 检查水平方向
    count = 1
    for i in range(col-1, -1, -1):
        if board[row][i] == board[row][col]:
            count += 1
        else:
            break
    for i in range(col+1, len(board[0])):
        if board[row][i] == board[row][col]:
            count += 1
        else:
            break
    if count >= 5:
        return board[row][col]

    # 检查垂直方向
    count = 1
    for i in range(row-1, -1, -1):
        if board[i][col] == board[row][col]:
            count += 1
        else:
            break
    for i in range(row+1, len(board)):
        if board[i][col] == board[row][col]:
            count += 1
        else:
            break
    if count >= 5:
        return board[row][col]

    # 检查左上到右下方向
    count = 1
    i, j = row-1, col-1
    while i >= 0 and j >= 0:
        if board[i][j] == board[row][col]:
            count += 1
        else:
            break
        i -= 1
        j -= 1
    i, j = row+1, col+1
    while i < len(board) and j < len(board[0]):
        if board[i][j] == board[row][col]:
            count += 1
        else:
            break
        i += 1
        j += 1
    if count >= 5:
        return board[row][col]

    # 检查右上到左下方向
    count = 1
    i, j = row-1, col+1
    while i >= 0 and j < len(board[0]):
        if board[i][j] == board[row][col]:
            count += 1
        else:
            break
        i -= 1
        j += 1
    i, j = row+1, col-1
    while i < len(board) and j >= 0:
        if board[i][j] == board[row][col]:
            count += 1
        else:
            break
        i += 1
        j -= 1
    if count >= 5:
        return board[row][col]

    return 0
# END: check_win
