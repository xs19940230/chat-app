//引入 express 框架
const express = require('express');
//创建express实例， 名为app
const app = express();
//创建http服务器
const http = require('http').createServer(app);
//引入socket.io模块，并创建实例io
const io = require('socket.io')(http);

// 提供静态文件（后面放 HTML）
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html'); // 默认登录页
});
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/phone.html');
});

let users = {
    'admin': '54desperado',
    'user': '54desperado'
};
let messageQueue = [];
const Max_Messages = 50;

// Socket.io 连接事件。
//为io设置一个事件监听器
io.on('connection', (socket) =>
    {console.log('user connected!');

        socket.on('login', ({ username, password }) => {
            if (users[username] && users[username] === password) {
                socket.username = username; // 记录用户身份
                socket.emit('loginSuccess');
                socket.emit('history', messageQueue); // 登录成功发历史消息
            } else {
                socket.emit('loginFail', '用户名或密码错误');
            }
        });
        socket.on('relogin', (username) => {
            if (users[username]) {
                socket.username = username;
                console.log('重新登录，用户:', socket.username);
                socket.emit('history', messageQueue);
            }
        });

        //接受客户端消息，并广播
        socket.on('chatMessage', (msg) => {
            if (!socket.username) {
                socket.emit('loginFail', '请先登录');
                return;
            }
            const message = {
                content: `${socket.username}: ${msg}`,
                timestamp: new Date().toLocaleString('zh-CN',{hour12: false})
            }
            if (messageQueue.length >= Max_Messages) {
                messageQueue.shift();
            }
            messageQueue.push(message);
            console.log('收到消息：',message.content,'队列长度：',messageQueue.length);
            io.emit('chatMessage', message);
        });
    socket.on('disconnect', () =>
    {console.log('user disconnected!');});
    socket.on('error', (err) => {
        console.log('Socket error: ',err);
    });
});

// 启动服务器
http.listen(3000,'0.0.0.0',() => {
    console.log('server running');
});