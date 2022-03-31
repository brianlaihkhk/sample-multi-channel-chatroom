var router = require('express').Router();
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');
var auth = require('../auth');


// Channel search
router.get('/channel', function(req, res, next){
    var limit = req.query.limit ? req.query.limit : 20;
    var start = req.query.start ? req.query.start : 0;
    var private = false;
    var visible = false;
    var title = req.query.title;

    Channel.find({ 'title' : { '$regex' : '.*' + title + '.*' }, 'private' : private, 'visible' : visible }).start(start).limit(limit).then(function(channelList){
        return res.json({channels: channelList.map(channel => channel.toJson())});
    });
});
  
router.get('/channel/:channelId', function(req, res, next){
    var channelId = req.channelId;

    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        Channel.findById(channelId).then(function(channel){
            if(err){ return next(err); }

            return res.json({channel: channel.getChannel(requestUser)});
        }).catch(next);
    })(req, res, next);
});

// Create channel (Public)
router.post('/channel', auth.required, function(req, res, next) {
    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser){
            if (!requestUser.guest){
                var channel = new Channel();
                channel.creator = requestUser._id;
                channel.title = req.body.channel.title;
                channel.description = req.body.channel.description;
                channel.private = req.body.channel.private;
                channel.visible = true;

                requestUser.channel.pop(channel._id);

                Promise.all([
                    requestUser.save(),
                    channel.save()
                ]).then(function(results){
                    return next("Success");
                }).catch(next);
            }
            return res.sendStatus(401);
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

// Join channel (Public)
router.post('/channel/:channelId', auth.required, function(req, res, next){
    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser){
            Channel.findById(req.channelId).then(function(channel){
                if(!channel.private){
                  return res.sendStatus(401);
                }

                channel.members.pop(requestUser._id);
                requestUser.channel.pop(channel._id);

                Promise.all([
                    requestUser.save(),
                    channel.save()
                ]).then(function(results){
                    return next("Success");
                }).catch(next);
            }).catch(next);
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

// Add specific user to channel
router.post('/channel/:channelId/:userId', auth.required, function(req, res, next){
    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser){
            Promise.all([
                Channel.findById(req.channelId).exec(),
                User.findById(req.userId).exec()
            ]).then(function(results){
                var channel = results[0];
                var targetUser = results[1];
          
                if (channel.private && channel.creator.toString() != requestUser._id.toString()){
                    return res.sendStatus(401);
                }
                if(!targetUser){
                    return res.sendStatus(401);
                }

                channel.members.pop(targetUser._id);
                targetUser.channel.pop(channel._id);

                Promise.all([
                    targetUser.save(),
                    channel.save()
                ]).then(function(results){
                    return next("Success");
                }).catch(next);
            }).catch(next);
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

// delete specific user from channel
router.delete('/channel/:channelId/:userId', auth.required, function(req, res, next){
    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser){
            Promise.all([
                Channel.findById(req.channelId).exec(),
                User.findById(req.userId).exec()
            ]).then(function(results){
                var channel = results[0];
                var targetUser = results[1];
          
                if (channel.creator.toString() != requestUser._id.toString()){
                    return res.sendStatus(401);
                }

                if(!targetUser){
                    return res.sendStatus(401);
                }

                if (channel.members.indexOf(targetUser._id) > -1) {
                    channel.members.splice(channel.members.indexOf(targetUser._id), 1)
                }
                if (targetUser.channel.indexOf(channel._id) > -1) {
                    targetUser.channel.splice(targetUser.channel.indexOf(channel._id), 1)
                }

                channel.key = this.generateString(12);

                Promise.all([
                    targetUser.save(),
                    channel.save()
                ]).then(function(results){
                    return next("Success");
                }).catch(next);
            }).catch(next);

        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

// delete channel
router.delete('/channel/:channelId', auth.required, function(req, res, next){
    passport.authenticate('local', {session: false}, function(err, requestUser, info) {
        if(err){ return next(err); }
    
        if(requestUser){
            Channel.findById(req.channelId).then(function(channel){
                if(requestUser._id != channel.creator){
                  return res.sendStatus(401);
                }

                channel.visible = false;
                channel.save();
                return next("Success");
            }).catch(next);
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

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
