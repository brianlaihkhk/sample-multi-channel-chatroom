var router = require('express').Router();
var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Channel = mongoose.model('Channel');
var auth = require('../auth');

// Channel search
router.get('/key/:channelId', auth.required, async function(req, res, next){
    var user = req.user;
    var channel = await Channel.findById(req.channelId).exec();

    if(!requestUser || !channel){
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }

    return res.json({success: true, channel: channel.getKey(user.id)});
});
  
// Message search
router.get('/archive/:channelId', auth.required, async function(req, res, next){
    var date = new Date();
    var limit = req.query.limit ? req.query.limit : 20;
    var start = req.query.start ? req.query.start : 0;
    var before = req.query.before ? date.setUTCMilliseconds(req.query.before) : date;
    var channelId = req.channelId;
    var user = req.user;

    var requestUser = await User.findById(user.id).exec();
    var channel = await Channel.findById(req.channelId).exec();

    if(!requestUser || !channel){
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }

    if(requestUser.channel.indexOf(channelId) > -1){
        var key = channel.getKey(requestUser);

        Message.find({ 'channel' : channelId, 'createdAt': { '$lt': before} }).start(start).limit(limit).then(function(messageList){
            return res.json({success: true, message: messageList.map(message => message.toJson(key))});
        });
    } else {
        return res.status(422).json({success: false, errors: {user: "Not belongs to channel"}});
    }

});


module.exports = router;
