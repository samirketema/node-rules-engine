var express = require('express');
var debug = require('debug')('node-rules-engine');
var bodyParser = require('body-parser');
var path = require('path');
var routes = require('./routes/index');

const LISTEN_PORT = 3000;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.set('port', LISTEN_PORT);

// Include routes at the root level of REST API
app.use('/', routes);

// Make app available to start-service.js script
module.exports = app;