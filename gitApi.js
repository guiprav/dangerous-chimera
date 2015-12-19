'use strict';

let childProcess = require('child_process');
let spawn = childProcess.spawn;

let app = require('./app');

app.post('/api/git/:command', function(req, res) {
    let child = spawn(
        'git', [req.params.command].concat(req.body.args || [])
    );

    child.stdout.on('data', function(data) {
        data.toString().split('\n').forEach(function(line) {
            res.write('out: ' + line + '\n');
        });
    });

    child.stderr.on('data', function(data) {
        data.toString().split('\n').forEach(function(line) {
            res.write('err: ' + line + '\n');
        });
    });

    child.on('close', function(exitCode) {
        res.write('code: ' + exitCode + '\n');
        res.end();
    });
});
