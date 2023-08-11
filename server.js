const express = require('express');
const { SocketAddress } = require('net');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const cors = require('cors');
const port = process.env.PORT || 3030;

app.use(cors());
app.use('/peerjs', peerServer)
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);
        })
    });
})

server.listen(port, () => {
    console.log(`App is running ono port ${port}`);
});