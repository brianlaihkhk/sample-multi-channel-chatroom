var amqp = require('amqplib');
var Channel = mongoose.model('Channel');
var Message = mongoose.model('Message');
var CryptoJS = require("crypto-js");

const conn = yield amqp.connect('amqp://localhost');
var storeQueue = 'store';

function saveQueueMessage() {
    conn.createChannel(function(err, channel) {
        if (err) {
          throw err;
        }

        channel.consume(storeQueue, function(queueMessage){
            try {
                var message = new Message();
                message.createdAt = queueMessage.createdAt;
                message.creator = queueMessage.creator;
                message.channel = queueMessage.channel;
                message.message = CryptoJS.AES.decrypt(queueMessage.message, queueMessage.key);
                await message.save();
                channel.ack(queueMessage);
            } catch (e) {
                channel.reject(queueMessage);
                console.log(e);
            }
        }, { noAck: false });

    });

}

function sendHeartbeatMessage() {
    conn.createChannel(function(err, channel) {
        if (err) {
            throw err;
        }

        for await (const channel of Channel.find()) {
            var topic = 'topic.' + channel._id;
            var message = {
                type : 'heartbeat',
                message : CryptoJS.AES.encrypt("heartbeat", channel.key),
                channel : channel._id,
                creator : 'system',
                createdAt : new Date()
            }
            this.sendMessage(topic, message);
        }
    });
}


function sendMessage (topicName, message) {
    conn.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }
        channel.publish(topicName, '', message);
        channel.close();
    });
}

module.exports = router;
