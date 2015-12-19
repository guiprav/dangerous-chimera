'use strict';

let path = require('path');
let resolvePath = path.resolve;

let multer = require('multer');

let upload = multer({
    storage: multer.diskStorage({}),
});

let ncp = require('ncp');
let mv = require('mv');
let rimraf = require('rimraf');

let app = require('./app');

let cwd = process.cwd();

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
