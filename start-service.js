#!/usr/bin/env node
var app = require('./app');

//Set port
app.set('port', process.env.PORT || 3000);

//Start service
var service = app.listen(app.get('port'), function () {
  console.log('rules-engine service started on port ' + service.address().port);
});