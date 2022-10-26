const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io'); 
const Actions = require('./src/Actions');
const { v4: uuidV4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config()

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static('build'));
app.use((req , res , next) => {
    res.sendFile(path.join(__dirname , "build" , "index.html"))
});

const userSocketMap = {};


function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username : userSocketMap[socketId],
        }
    });
}

io.on('connection' , (socket) => {
    console.log("New client is connected." + "With Socket Id : " + socket.id);

    socket.on(Actions.JOIN , ({roomId , username , videoStream}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(Actions.JOINED , {
                clients,
                username,
                socketId : socket.id,
            });
        })
    });

    socket.on(Actions.CODE_CHANGE , ({roomId , code}) => {
        socket.in(roomId).emit(Actions.CODE_CHANGE , {code});
    });

    socket.on(Actions.SYNC_CODE , ({code , socketId}) => {
        io.to(socketId).emit(Actions.CODE_CHANGE , {code});
    });

    socket.on('disconnecting' , () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(Actions.DISCONNECTED , {
                socketId : socket.id,
                username : userSocketMap[socket.id]
            })
        })
        delete userSocketMap[socket.id];
        socket.leave();
    })


    // Video Call
    socket.on('video-join-room', (roomId, userId) => {
        // socket.join(roomId)
        // console.log(roomId + " " + userId)
        const clients = getAllConnectedClients(roomId);
        socket.on('ready', () => {
            clients.forEach(({socketId}) => {
                io.to(socketId).emit('user-connected' , userId);
            })
        })
    })
    socket.on('video-disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })

});

const PORT = process.env.PORT;

server.listen(PORT , () => console.log(`Listening on port ${PORT}...`) );