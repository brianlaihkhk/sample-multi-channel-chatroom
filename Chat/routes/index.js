var router = require('express').Router(),
    amqp = require('amqplib'),
    CryptoJS = require("crypto-js");

var storeQueue = 'store';

router.ws('/chat/:channelId/:userId', async (ws, req) => {
    var conn = await amqp.connect('amqp://localhost');

    var topic = 'topic.' + req.channelId;
    var queue = 'chat.' + req.channelId + '.' + this.generateString(12);
    var key = this.refreshKey(req.channelId);

    this.createTopic(topic);
    this.createQueue(topic, queue);

    // listener for kafka/kinesis
    conn.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }

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

    });

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

function deleteQueue (queueName) {
    conn.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }

        channel.deleteQueue(queueName, function(err, ok){
            if (err) {
                return false;
            }
            return true;
        });

        channel.close();
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

function createTopic (topicName) {
    conn.createChannel(function(err, channel) {
        if (err) {
          throw err;
        }
      
        channel.assertExchange(topicName, 'fanout', {
           durable: false
        });

        channel.close();
    });
}

function createQueue (topicName, queueName) {
    conn.createChannel(function(err, channel) {
        if (err) {
          throw err;
        }
      
        channel.assertQueue(queueName, function(err, ok) {
            if (err) {
              throw err;
            }
            channel.bindQueue(queueName, topicName, "", function(err, ok) {
                if (err) {
                  throw err;
                }
            });
        }, {'messageTtl' : 60000, 'expires' : 86400000 });

        channel.assertQueue(storeQueue, function(err, ok) {
            if (err) {
              throw err;
            }
            channel.bindQueue(storeQueue, topicName, "");
        });

        channel.close();
    });
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
