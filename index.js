var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
      }
});
var port = process.env.PORT || 8087;

// io.on('connection', socket => {
//     console.log('connected to ws', new Date().getTime());
//     io.emit('test_event', {data: 'data from socket serve'});
// });
const userList = {};
io.on('connection', socket => {
    socket.on('room_join_request', payload => {
        userList[socket.id] = payload.userData;
        console.log('userList', userList);
        socket.join(payload.roomName, err => {
            if (!err) {
                // console.log('socket>>>>', socket);
                io.in(payload.roomName).clients((err, clients) => {
                    if (!err) {
                        io.in(payload.roomName).emit('room_users', {clients, userList, newJoiner: payload.userData})
                    }
                });
            }
        })
    })

    socket.on('offer_signal', payload => {
        io.to(payload.calleeId).emit('offer', { signalData: payload.signalData, callerId: payload.callerId });
    });

    socket.on('answer_signal', payload => {
        io.to(payload.callerId).emit('answer', { signalData: payload.signalData, calleeId: socket.id });
    });

    socket.on('disconnect', () => {
        delete userList[socket.id];
        io.emit('room_left', { type: 'disconnected', socketId: socket.id, userList });
        console.log('disconnected room', userList);
    })
});

http.listen(port, () => console.log('listening on *:' + port)); 