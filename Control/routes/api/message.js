var router = require('express').Router();
var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var User = mongoose.model('User');
var auth = require('../auth');


// Message search
router.get('/message/:channelId', function(req, res, next){
    var limit = req.query.limit ? req.query.limit : 20;
    var start = req.query.start ? req.query.start : 0;
    var before = req.query.before ? req.query.before : Date.now();
    var channelId = req.query.channelId;

    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser && requestUser.channel.indexOf(channelId) > -1){
            Channel.find({ 'createdAt': { '$lt': before} }).start(start).limit(limit).then(function(messageList){
                return res.json({message: messageList.map(message => message.toJson())});
            });
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});