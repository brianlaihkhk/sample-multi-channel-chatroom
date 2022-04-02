var router = require('express').Router(),
    amqp = require('amqplib'),
    CryptoJS = require("crypto-js");

var storeQueue = 'store';
var conn = null;

async function connect() {
    var isProduction = process.env.NODE_ENV === 'production';

    if(isProduction){
        conn = await amqp.connect(process.env.AQMP_URI);
    } else {
        var username = 'chat';
        var password = encodeURIComponent('MusicRocks+');
        conn = await amqp.connect('amqp://' + username + ':' + password + '@localhost:5672');
    }

}

router.ws('/chat/:channelId/:userId', async (ws, req) => {
    if (!conn) { await this.connect(); }

    var topic = 'topic.' + req.channelId;
    var queue = 'chat.' + req.channelId + '.' + this.generateString(12);
    var key = this.refreshKey(req.channelId);

    this.createTopic(topic);
    this.createQueue(topic, queue);

    // listener for kafka/kinesis
    var channel = await conn.createChannel();

    channel.consume(queueName, function(message){
        try {
            // check message is able to decode
            CryptoJS.AES.decrypt(message, key);

            var response = {
                createdAt : message.createdAt,
                creator : message.creator,
                message : message.message,
                type : message.type
            }

            ws.send(response);
            channel.ack(message);
        } catch (e) {
            console.log(e);
            channel.reject(message);
            console.log('Message reset, update encrypt key and reconnect again');
            ws.close();
        }
    }, { noAck: false });

    ws.on('message', msg => {
        try {
            // check message is able to decode
            CryptoJS.AES.decrypt(message, key);

            // Send message to kafka / Kinesis
            var message = { 
                creator : req.userId,
                message : msg,
                type : 'message',
                createdAt : new Date(), 
                channel : req.channelId,
                key : key
            };

            this.sendMessage(topic, message);
        } catch (e) {
            console.log(e);
            console.log('Message is unable process, update encrypt key and reconnect again');
            ws.close();
        }
    });

    ws.on('close', () => {
        this.deleteQueue(queue);
        console.log('WebSocket was closed');
    });
})

async function deleteQueue (queueName) {
    var channel = await conn.createChannel();

    channel.deleteQueue(queueName).then(function (ok){
        return true;
    }).catch(function (err){ return false; });

    channel.close();

}

async function sendMessage (topicName, message) {
    if (!conn) { await this.connect(); }
    
    var channel = await conn.createChannel();

    channel.publish(topicName, '', message);
    channel.close();
}

async function createTopic (topicName) {
    if (!conn) { await this.connect(); }

    var channel = await conn.createChannel();

      
    channel.assertExchange(topicName, 'fanout', {
        durable: false
    });

    channel.close();

}

async function createQueue (topicName, queueName) {
    if (!conn) { await this.connect(); }

    var channel = await conn.createChannel();

    channel.assertQueue(queueName, {'messageTtl' : 60000, 'expires' : 86400000 }).then(function(ok) {
        channel.bindQueue(queueName, topicName, "");
    });

    channel.assertQueue(storeQueue).then(function(ok) {
        channel.bindQueue(storeQueue, topicName, "");
    });

    channel.close();
}

function refreshKey (channelId) {
    Channel.findById(channelId).then(function(channel){
        if(err){ 
            return null;
        }
        return channel.key;
    });
}

function generateString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = router;
