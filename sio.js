'use strict';

let server = require('./server');

let sio = require('socket.io')(server);

exports.clients = new Set();

sio.on('connection', function(client) {
    exports.clients.add(client);

    client.on('disconnect', function() {
        exports.clients.delete(client);
    });
});
