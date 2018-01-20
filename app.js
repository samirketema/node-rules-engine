var express = require('express');
var debug = require('debug')('node-rules-engine');
var bodyParser = require('body-parser');
var path = require('path');

const LISTEN_PORT = 3000;

var app = express();
app.use(bodyParser.json());
app.set('port', LISTEN_PORT);

module.exports = app;