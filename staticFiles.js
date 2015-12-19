'use strict';

let express = require('express');

let app = require('./app');

app.use(express.static(process.cwd()));
