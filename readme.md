# 在线五子棋
本项目后端使用Flask
前端没有使用框架，用原始HTML+CSS+JS手搓
### 项目运行预览

将项目clone下来之后，首先配置后端环境，执行如下命令安装项目依赖

```bash
pip install -r requirements.txt
```

然后运行app.py程序，程序默认在http://localhost:5000 运行，注意防火墙设置

然后打开浏览器进入http://localhost:5000 即可查看网页运行

**注意：** 如果要在服务器上测试，请把``` /static/index.js ```、 ``` /static/roomList.js ``` 、``` /static/gamePVP.js ``` 这几个文件里面的请求地址换成你的服务器公网IP。（在各js文件的开头标注了，gamePVP.js 在第239行）
