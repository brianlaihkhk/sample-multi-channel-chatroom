var http = require('http');
var handle = require('./handle');

http.createServer(function (req, res) {
  handle.saveQueueMessage();
  setInterval(handle.sendHeartbeatMessage, 30000);
}).listen(8080);
