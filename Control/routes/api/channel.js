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
        return res.json({success: true, channels: channelList.map(channel => channel.toJson())});
    });
});
  
router.get('/channel/:channelId', auth.required, async function(req, res, next){
    var user = req.user;
    var channelId = req.channelId;

    var channel = await Channel.findById(channelId).exec();
    return res.json({success: true, channel: channel.getChannel(user.id)});
});

// Create channel (Public)
router.post('/channel', auth.required, async function(req, res, next) {
    var user = req.user;

    var requestUser = await User.findById(user.id).exec();

    if(requestUser && !requestUser.guest){
        var channel = new Channel();
        channel.creator = requestUser._id;
        channel.title = req.body.title;
        channel.description = req.body.description;
        channel.private = req.body.private;
        channel.visible = true;

        await channel.save()
        requestUser.channel.push(result._id);

        await requestUser.save();
        return next({success: true});

    } else {
        return res.sendStatus(401);
    }

});

// Join channel (Public)
router.post('/channel/:channelId', auth.required, async function(req, res, next){
    var user = req.user;
    var requestUser = await User.findById(user.id).exec();
    
    if(requestUser){
        var channel = await Channel.findById(req.channelId).exec();
        if(!channel.private){
            return res.sendStatus(401);
        }

        channel.members.push(requestUser._id);
        requestUser.channel.push(channel._id);

        await requestUser.save(),
        await channel.save()

        return next({success: true});
    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
});

// Add specific user to channel
router.post('/channel/:channelId/:userId', auth.required, async function(req, res, next){
    var user = req.user;
    var requestUser = await User.findById(user.id).exec();

    if(requestUser){
        var channel = await Channel.findById(req.channelId).exec();
        var targetUser = await User.findById(req.userId).exec();
    
        if (channel.private && channel.creator.toString() != requestUser._id.toString()){
            return res.sendStatus(401);
        }
        if(!targetUser){
            return res.sendStatus(401);
        }

        channel.members.push(targetUser._id);
        targetUser.channel.push(channel._id);

        await targetUser.save();
        await channel.save();

        return next({success: true});
    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
});

// delete specific user from channel
router.delete('/channel/:channelId/:userId', auth.required, async function(req, res, next){
    var user = req.user;
    var requestUser = await User.findById(user.id).exec();
    
    if(requestUser){
        var channel = await Channel.findById(req.channelId).exec(),
        var targetUser = await User.findById(req.userId).exec()

        if (channel.creator.toString() != requestUser._id.toString()){
            return res.sendStatus(401);
        }

        if(!targetUser){
            return res.sendStatus(401);
        }

        if (channel.members.indexOf(targetUser._id) > -1 || requestUser._id == channel.creator) {
            channel.members.splice(channel.members.indexOf(targetUser._id), 1)
        }
        if (targetUser.channel.indexOf(channel._id) > -1) {
            targetUser.channel.splice(targetUser.channel.indexOf(channel._id), 1)
        }

        channel.key = this.generateString(12);

        await targetUser.save();
        await channel.save();

        return next({success: true});

    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
});

// delete channel
router.delete('/channel/:channelId', auth.required, async function(req, res, next){
    var user = req.user;
    var requestUser = await User.findById(user.id).exec();
    
    if(requestUser){
        var channel = await Channel.findById(req.channelId).exec();

        if(requestUser._id != channel.creator){
            return res.sendStatus(401);
        }

        channel.visible = false;
        await channel.save();
        return next({success: true});
    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
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
