# import json

# class Node:
#     def __init__(self, data):
#         self.data = data
#         self.left = None
#         self.right = None
#         self.height = 1

# class AVLTree:
#     def __init__(self):
#         self.root = None

#     def height(self, node):
#         if not node:
#             return 0
#         return node.height

#     def balance_factor(self, node):
#         if not node:
#             return 0
#         return self.height(node.left) - self.height(node.right)

#     def rotate_right(self, z):
#         y = z.left
#         T2 = y.right

#         y.right = z
#         z.left = T2

#         z.height = 1 + max(self.height(z.left), self.height(z.right))
#         y.height = 1 + max(self.height(y.left), self.height(y.right))

#         return y

#     def rotate_left(self, y):
#         x = y.right
#         T2 = x.left

#         x.left = y
#         y.right = T2

#         y.height = 1 + max(self.height(y.left), self.height(y.right))
#         x.height = 1 + max(self.height(x.left), self.height(x.right))

#         return x

#     def insert(self, root, data):
#         if not root:
#             return Node(data)

#         if data["score"] < root.data["score"]:
#             root.left = self.insert(root.left, data)
#         elif data["score"] > root.data["score"]:
#             root.right = self.insert(root.right, data)
#         else:
#             if data["win"] < root.data["win"]:
#                 root.left = self.insert(root.left, data)
#             elif data["win"] > root.data["win"]:
#                 root.right = self.insert(root.right, data)
#             else:
#                 if data["peace"] < root.data["peace"]:
#                     root.left = self.insert(root.left, data)
#                 else:
#                     root.right = self.insert(root.right, data)

#         root.height = 1 + max(self.height(root.left), self.height(root.right))
#         balance = self.balance_factor(root)

#         if balance > 1:
#             if data["score"] < root.left.data["score"]:
#                 return self.rotate_right(root)
#             elif data["score"] > root.left.data["score"]:
#                 root.left = self.rotate_left(root.left)
#                 return self.rotate_right(root)

#         if balance < -1:
#             if data["score"] > root.right.data["score"]:
#                 return self.rotate_left(root)
#             elif data["score"] < root.right.data["score"]:
#                 root.right = self.rotate_right(root.right)
#                 return self.rotate_left(root)

#         return root

#     def search(self, root, score, win, peace):
#         if not root:
#             return None

#         if score < root.data["score"]:
#             return self.search(root.left, score, win, peace)
#         elif score > root.data["score"]:
#             return self.search(root.right, score, win, peace)
#         else:
#             if win < root.data["win"]:
#                 return self.search(root.left, score, win, peace)
#             elif win > root.data["win"]:
#                 return self.search(root.right, score, win, peace)
#             else:
#                 if peace < root.data["peace"]:
#                     return self.search(root.left, score, win, peace)
#                 elif peace > root.data["peace"]:
#                     return self.search(root.right, score, win, peace)
#                 else:
#                     return root.data

#     def delete(self, root, score, win, peace):
#         if not root:
#             return None

#         if score < root.data["score"]:
#             root.left = self.delete(root.left, score, win, peace)
#         elif score > root.data["score"]:
#             root.right = self.delete(root.right, score, win, peace)
#         else:
#             if win < root.data["win"]:
#                 root.left = self.delete(root.left, score, win, peace)
#             elif win > root.data["win"]:
#                 root.right = self.delete(root.right, score, win, peace)
#             else:
#                 if peace < root.data["peace"]:
#                     root.left = self.delete(root.left, score, win, peace)
#                 elif peace > root.data["peace"]:
#                     root.right = self.delete(root.right, score, win, peace)
#                 else:
#                     if not root.left:
#                         return root.right
#                     elif not root.right:
#                         return root.left
#                     temp = self.get_min(root.right)
#                     root.data = temp.data
#                     root.right = self.delete(root.right, temp.data["score"], temp.data["win"], temp.data["peace"])

#         if not root:
#             return root

#         root.height = 1 + max(self.height(root.left), self.height(root.right))
#         balance = self.balance_factor(root)

#         if balance > 1:
#             if self.balance_factor(root.left) >= 0:
#                 return self.rotate_right(root)
#             else:
#                 root.left = self.rotate_left(root.left)
#                 return self.rotate_right(root)

#         if balance < -1:
#             if self.balance_factor(root.right) <= 0:
#                 return self.rotate_left(root)
#             else:
#                 root.right = self.rotate_right(root.right)
#                 return self.rotate_left(root)

#         return root

#     def get_min(self, root):
#         while root.left:
#             root = root.left
#         return root

#     def insert_data(self, data):
#         self.root = self.insert(self.root, data)

#     def search_data(self, score, win, peace):
#         return self.search(self.root, score, win, peace)

#     def delete_data(self, score, win, peace):
#         self.root = self.delete(self.root, score, win, peace)

#     def inorder_traversal(self, root):
#         result = []
#         if root:
#             result = self.inorder_traversal(root.left)
#             result.append(root.data)
#             result += self.inorder_traversal(root.right)
#         return result

# def read_json_file(file_path):
#     with open(file_path, 'r') as file:
#         data = json.load(file)
#     return data

# def main():
#     avl_tree = AVLTree()
#     user_data = read_json_file('/Users/markyangkp/Desktop/Projects/gobang/gobang/userData.json')

#     for user in user_data:
#         avl_tree.insert_data(user)

#     # 示例搜索、插入、删除操作
#     search_result = avl_tree.search_data(1321, 55, 3)
#     print("Search Result:", search_result)

#     new_user = {
#         "userID": 789012,
#         "win": 40,
#         "fail": 10,
#         "peace": 5,
#         "score": 1321,
#         "userName": "Alice"
#     }
#     avl_tree.insert_data(new_user)

#     avl_tree.delete_data(1321, 55, 3)

#     # 输出中序遍历结果
#     print("Inorder Traversal:", avl_tree.inorder_traversal(avl_tree.root))

# if __name__ == "__main__":
#     main()


# userData = [
#     {"i":1},
#     {"i":2},
#     {"i":3}
# ]

# for user in userData:
#     if user["i"] == 2:
#         user["i"] = 100

# print(userData)