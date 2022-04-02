var mongoose = require('mongoose');

var isProduction = process.env.NODE_ENV === 'production';

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  var username = 'message';
  var password = 'MangoJuice%';
  mongoose.connect('mongodb://' + username + ':' + password + '@localhost:27017/Chat');
  mongoose.set('debug', true);
}

require('./models/Message');
require('./models/Channel');
var handle = require('./handle');

handle.saveQueueMessage();
setInterval(handle.sendHeartbeatMessage, 30000);