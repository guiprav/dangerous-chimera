'use strict';

let watch = require('watchr').watch;

let sio = require('./sio');
let statToPod = require('./statToPod');

watch({
    path: process.cwd(),

    persistent: false,

    listener: function(type, path, stat, oldStat) {
        sio.clients.forEach(function(client) {
            client.emit(type, {
                path,

                stat: statToPod(stat),
                oldStat: statToPod(oldStat),
            });
        });
    },
});
