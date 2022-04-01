var http = require('http'),
    path = require('path'),
    express = require('express'),
    enableWs = require('express-ws'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    SocketServer = require('ws').Server;

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();
enableWs(app);

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (!isProduction) {
  app.use(errorhandler());
}

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3001, function(){
  console.log('Server listening on port ' + server.address().port);
});

new SocketServer({ server });