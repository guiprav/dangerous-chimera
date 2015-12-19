'use strict';

let express = require('express');

exports = module.exports = express();

exports.use(require('body-parser').json());
