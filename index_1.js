var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
      }
});
var port = process.env.PORT || 3000;

io.on('connection', socket => {
    io.emit('test_event', {type: 'test_res'}); 
    socket.on('room_join_request', payload => { 
        console.log('join room', payload.roomName);
        socket.join(payload.roomName, err => {
            if (!err) {
                io.in(payload.roomName).clients((err, clients) => {  
                    if (!err) {
                        io.in(payload.roomName).emit('room_users', clients)
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
        io.emit('room_left', { type: 'disconnected', socketId: socket.id })
    })
});

http.listen(port, () => console.log('listening on *:' + port)); 