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
    res.sendFile(__dirname + '/public/phone.html');
});

let users = [];

// Socket.io 连接事件。
//为io设置一个事件监听器
io.on('connection', (socket) =>
    {console.log('user connected!');
        //接受客户端消息，并广播
        socket.on('chatMessage', (msg) => {
            io.emit('chatMessage', msg);
        });
    socket.on('disconnect', () =>
    {console.log('user disconnected!');});
});

// 启动服务器
http.listen(3000,'0.0.0.0',() => {
    console.log('server running');
});