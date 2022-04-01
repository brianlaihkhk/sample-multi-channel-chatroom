var http = require('http'),
    handle = require('./handle'),
    mongoose = require('mongoose');

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://message:MangoJuice%@localhost:27017/Chat');
  mongoose.set('debug', true);
}

http.createServer(function (req, res) {
  handle.saveQueueMessage();
  setInterval(handle.sendHeartbeatMessage, 30000);
}).listen(8080);
