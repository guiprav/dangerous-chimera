'use strict';

let path = require('path');
let resolvePath = path.resolve;
let http = require('http');
let childProcess = require('child_process');
let spawn = childProcess.spawn;

let ncp = require('ncp');
let mv = require('mv');
let rimraf = require('rimraf');
let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');

let app = express();

let server = http.createServer(app);

let io = require('socket.io')(server);

let upload = multer({
    storage: multer.diskStorage({}),
});

let cwd = process.cwd();

app.use(bodyParser.json());

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

app.use(express.static(cwd));

app.use(function(req, res, next) {
    req.actionPath = resolvePath(cwd, req.url.slice(1));

    if(!req.actionPath.startsWith(cwd)) {
        res.status(403);
        res.send();

        return;
    }

    next();
});

app.put('*', upload.single('file'), function(req, res) {
    // TODO: Properly handle long operations and timeouts.
    mv(req.file.path, req.actionPath, { mkdirp: true }, function(err) {
        if(err) {
            res.status(500);
            res.send(err);

            return;
        }

        res.send();
    });
});

app.copy('*', function(req, res) {
    let destPath = resolvePath(cwd, req.body.to);

    if(!destPath.startsWith(cwd)) {
        res.status(403);
        res.send();

        return;
    }

    // TODO: Properly handle long operations and timeouts.
    ncp(req.actionPath, destPath, function(err) {
        if(err) {
            res.status(500);
            res.send(err);

            return;
        }

        res.send();
    });
});

app.move('*', function(req, res) {
    let destPath = resolvePath(cwd, req.body.to);

    if(!destPath.startsWith(cwd)) {
        res.status(403);
        res.send();

        return;
    }

    // TODO: Properly handle long operations and timeouts.
    mv(req.actionPath, destPath, function(err) {
        if(err) {
            res.status(500);
            res.send(err);

            return;
        }

        res.send();
    });
});

app.delete('*', function(req, res) {
    rimraf(req.actionPath, function(err) {
        if(err) {
            res.status(500);
            res.send(err);

            return;
        }

        res.send();
    });
});

let ioClients = new Set();

io.on('connection', function(client) {
    ioClients.add(client);

    client.on('disconnect', function() {
        ioClients.delete(client);
    });
});

let watch = require('watchr').watch;

function statToPod(stat) {
    if(!stat) {
        return;
    }

    let pod = {};

    [
        'ino',
        'mode',
        'uid',
        'gid',
        'size',
        'atime',
        'mtime',
        'ctime',
        'birthtime',
    ].forEach(function(key) {
        pod[key] = stat[key];
    });

    return pod;
}

watch({
    path: cwd,

    persistent: false,

    listener: function(type, path, stat, oldStat) {
        ioClients.forEach(function(client) {
            client.emit(type, {
                path,

                stat: statToPod(stat),
                oldStat: statToPod(oldStat),
            });
        });
    },
});

server.listen(process.env.PORT || 3000);
