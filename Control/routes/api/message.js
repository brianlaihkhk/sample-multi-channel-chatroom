var router = require('express').Router();
var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Channel = mongoose.model('Channel');
var auth = require('../auth');


// Channel search
router.get('/key/:channelId', function(req, res, next){
    var channelId = req.channelId;

    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        Channel.findById(channelId).then(function(channel){
            if(err){ return next(err); }

            return res.json({channel: channel.getKey(requestUser)});
        }).catch(next);
    })(req, res, next);
});
  
// Message search
router.get('/archive/:channelId', auth.required, function(req, res, next){
    var date = new Date();
    var limit = req.query.limit ? req.query.limit : 20;
    var start = req.query.start ? req.query.start : 0;
    var before = req.query.before ? date.setUTCMilliseconds(req.query.before) : date;
    var channelId = req.channelId;

    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser && requestUser.channel.indexOf(channelId) > -1){
            Message.find({ 'channel' : channelId, 'createdAt': { '$lt': before} }).start(start).limit(limit).then(function(messageList){
                return res.json({message: messageList.map(message => message.toJson())});
            });
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});


module.exports = router;
