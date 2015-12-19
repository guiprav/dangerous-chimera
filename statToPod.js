'use strict';

module.exports = function(stat) {
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
};
