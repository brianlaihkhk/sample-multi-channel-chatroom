var amqp = require('amqplib'),
    mongoose = require('mongoose'),
    Channel = mongoose.model('Channel'),
    Message = mongoose.model('Message'),
    CryptoJS = require("crypto-js");

var storeQueue = 'store';
var conn = null;

module.exports = {
    connect : async function () {
        var isProduction = process.env.NODE_ENV === 'production';

        if(isProduction){
            conn = await amqp.connect(process.env.AQMP_URI);
        } else {
            var username = 'message';
            var password = encodeURIComponent('MangoJuice%');
            conn = await amqp.connect('amqp://' + username + ':' + password + '@localhost:5672');
        }

    },

    saveQueueMessage : async function () {
        if (!conn) { await this.connect(); }
        console.log ('saveQueueMessage init 1');


        var channel = await conn.createChannel();
        console.log ('saveQueueMessage init 2');

        channel.assertQueue(storeQueue).then(function(ok) {
            console.log ('ok ');
        });

        console.log ('saveQueueMessage init 3');

        channel.consume(storeQueue, async function(queueMessage){
            console.log ('queueMessage received ');

            try {
                var message = new Message();
                message.createdAt = queueMessage.createdAt;
                message.creator = queueMessage.creator;
                message.channel = queueMessage.channel;
                message.message = CryptoJS.AES.decrypt(queueMessage.message, queueMessage.key);
                if (queueMessage.type != 'heartbeat'){
                    await message.save();
                    channel.ack(queueMessage);
                }
            } catch (e) {
                channel.reject(queueMessage);
                console.log(e);
            }
        }, { noAck: false });

    },

    sendHeartbeatMessage : async function  () {
        if (!conn) { await this.connect(); }

        console.log ('sendHeartbeatMessage init ');
        var mqChannel = await conn.createChannel();

        var cursor = Channel.find({}).cursor({batchSize:50});

        if (cursor) {
            cursor.eachAsync((channel) => {
                var topic = 'topic.' + channel._id;
                var message = {
                    type : 'heartbeat',
                    message : CryptoJS.AES.encrypt("heartbeat", channel.key),
                    channel : channel._id,
                    creator : 'system',
                    createdAt : new Date()
                }

                console.log("processing : " + topic);

                this.sendMessage(mqChannel, topic, message);
            });
        }
        mqChannel.close();
    },


    sendMessage : function (channel, topic, message) {

        channel.assertExchange(topic, 'fanout', {
            durable: false
        }).then(function(ok) {
            channel.bindQueue(storeQueue, topic, "");
        });

        channel.publish(topic, '', message);

    }
}