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

router.ws('/chat/:channelId', async (ws, req) => {
    if (!conn) { await this.connect(); }

    var topic = 'topic.' + req.channelId;
    var queue = 'chat.' + req.channelId + '.' + this.generateString(12);
    var key = this.refreshKey(req.channelId);

    this.createTopic(topic);
    this.createQueue(topic, queue);

    // listener for kafka/kinesis
    var channel = await conn.createChannel();

    channel.consume(queueName, async function(msg){
        try {
            var queueMessage = JSON.parse(msg.content);
            // check message is able to decode
            CryptoJS.AES.decrypt(queueMessage.message, queueMessage.key);

            var response = {
                createdAt : queueMessage.createdAt,
                creator : queueMessage.creator,
                message : queueMessage.message,
                type : queueMessage.type
            }

            ws.send(response);
            await channel.ack(msg);

            if (key != queueMessage.key){
                console.log('Message reset, update encrypt key and reconnect again');
                ws.close();
            }
        } catch (e) {
            console.log(e);
            await channel.reject(msg);
            console.log('Message reset, update encrypt key and reconnect again');
            ws.close();
        }
    }, { noAck: false });

    ws.on('message', receiveMessage => {
        try {
            if (key != receiveMessage.key){
                console.log('Message reset, update encrypt key and reconnect again');
                ws.close();
            }

            // check message is able to decode
            CryptoJS.AES.decrypt(receiveMessage.message, receiveMessage.key);

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

    await channel.deleteQueue(queueName);
    channel.close();

    return true;

}

async function sendMessage (topicName, message) {
    if (!conn) { await this.connect(); }
    var channel = await conn.createChannel();

    await channel.publish(topicName, '', Buffer.from(JSON.stringify(message)));
    channel.close();
}

async function createTopic (topicName) {
    if (!conn) { await this.connect(); }
    var channel = await conn.createChannel();

    await channel.assertExchange(topicName, 'fanout', {
        durable: false
    });

    channel.close();

}

async function createQueue (topicName, queueName) {
    if (!conn) { await this.connect(); }
    var channel = await conn.createChannel();

    await channel.assertQueue(queueName, {'messageTtl' : 60000, 'expires' : 86400000 });
    await channel.bindQueue(queueName, topicName, "");

    await channel.assertQueue(storeQueue);
    await channel.bindQueue(storeQueue, topicName, "");

    channel.close();
}

async function refreshKey (channelId) {
    var channel = await Channel.findById(channelId);
    return channel.key;
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
