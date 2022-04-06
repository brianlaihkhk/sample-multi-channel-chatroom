var amqp = require('amqplib'),
    mongoose = require('mongoose'),
    Channel = mongoose.model('Channel'),
    Message = mongoose.model('Message'),
    CryptoJS = require("crypto-js");

var storeQueue = 'store';
var conn = null;

module.exports = {
    connect : async () => {
        var isProduction = process.env.NODE_ENV === 'production';

        if(isProduction){
            conn = await amqp.connect(process.env.AQMP_URI);
        } else {
            var username = 'message';
            var password = encodeURIComponent('MangoJuice%');
            conn = await amqp.connect('amqp://' + username + ':' + password + '@localhost:5672');
        }

    },

    saveQueueMessage : async () => {
        if (!conn) { await this.connect(); }
        var channel = await conn.createChannel();

        await channel.assertQueue(storeQueue);

        channel.consume(storeQueue, async function(msg){
            var queueMessage = JSON.parse(msg.content);

            try {
                var decryptedMessage = CryptoJS.AES.decrypt(queueMessage.message, queueMessage.key);

                if (queueMessage.type != 'heartbeat'){
                    var message = new Message();

                    message.createdAt = queueMessage.createdAt;
                    message.creator = queueMessage.creator;
                    message.channel = queueMessage.channel;
                    message.message = decryptedMessage.toString(CryptoJS.enc.Utf8);
                    await message.save();
                }

                console.log ('[' + storeQueue + '(' + queueMessage.channel + ')] queueMessage received : ' + message.message);

                await channel.ack(msg);
            } catch (e) {
                await channel.reject(msg, {requeue : false});
                console.log(e);
            }
        }, { noAck: false });

    },

    sendHeartbeatMessage : async () => {
        if (!conn) { await this.connect(); }

        var mqChannel = await conn.createChannel();

        try {
            for await (const channel of Channel.find({}).cursor({ batchSize: 50 })){
                var topic = 'topic.' + channel._id;
                var message = {
                    type : 'heartbeat',
                    message : CryptoJS.AES.encrypt("heartbeat", channel.key).toString(),
                    channel : channel._id,
                    creator : 'system',
                    createdAt : new Date(),
                    key : channel.key
                }

                console.log('[' + topic + '] processing');
                
                await mqChannel.assertExchange(topic, 'fanout', {
                    durable: false
                })
                
                await mqChannel.bindQueue(storeQueue, topic, "");
                await mqChannel.publish(topic, '', Buffer.from(JSON.stringify(message)));

                console.log('[' + topic + '] Sent');
            }

            mqChannel.close();
        } catch (e) {
            mqChannel.close();
            console.log(e);
        }
    }
}
