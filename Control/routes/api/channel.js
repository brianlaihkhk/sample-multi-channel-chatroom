var router = require('express').Router();
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');
var auth = require('../auth');

// Channel search
router.get('/channel', auth.required, async function(req, res, next){
    var limit = req.query.limit ? req.query.limit : 20;
    var start = req.query.start ? req.query.start : 0;
    var private = false;
    var visible = false;
    var title = req.query.title;

    var channelList = await Channel.find({ 'title' : { '$regex' : '.*' + title + '.*' }, 'private' : private, 'visible' : visible }).skip(start).limit(limit).exec();
    
    return res.json({success: true, channels: channelList.map(channel => channel.toJson())});
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
        console.log("requestUser._id " + requestUser._id);
        channel.creator = requestUser._id;
        channel.title = req.body.title;
        channel.alias = req.body.alias;
        channel.description = req.body.description;
        channel.private = req.body.private;
        channel.visible = true;
        channel.key = generateString(12);
        channel.members = [];

        await channel.save();
        requestUser.channel = requestUser.channel.concat([channel._id]);

        await requestUser.save();
        return res.json({success: true, channel: channel.toJson(), key: channel.getKey(user.id) });

    } else {
        return res.sendStatus(401);
    }

});


router.put('/channel/:channelId', auth.required, async function(req, res, next){
    var channelId = req.channelId;
    var channel = await Channel.findById(channelId).exec();
  
    if(channel){

        if (!channel.isCreator(req.user.id)){
            return res.sendStatus(401);
        }

        // only update fields that were actually passed...
        if(typeof req.body.title !== 'undefined'){
            channel.title = req.body.title;
        }

        if(typeof req.body.description !== 'undefined'){
            channel.description = req.body.description;
        }

        if(typeof req.body.private !== 'undefined'){
            channel.private = boolean(req.body.private);
        }
    
        await channel.save();
        return res.json({success: true});

    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
  });

// Join channel (Public)
router.post('/channel/:channelId', auth.required, async function(req, res, next){
    var user = req.user;
    var requestUser = await User.findById(user.id).exec();
    var channel = await Channel.findById(req.channelId).exec();

    if(channel && requestUser){

        if(!channel.private){
            return res.sendStatus(401);
        }

        channel.members = channel.members.concat([requestUser._id]);
        requestUser.channel = requestUser.channel.concat([channel._id]);

        await requestUser.save(),
        await channel.save()

        return res.json({success: true, key: channel.getKey(user.id)});

    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
});

// Add specific user to channel
router.post('/channel/:channelId/:userId', auth.required, async function(req, res, next){
    var channel = await Channel.findById(req.channelId).exec();
    var targetUser = await User.findById(req.userId).exec();
    
    if(!targetUser || !channel){
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }

    if (channel.private && !channel.isCreator(req.user.id)){
        return res.sendStatus(401);
    }

    if (channel.isCreator(targetUser._id)){
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }

    channel.members = channel.members.concat([targetUser._id]);
    targetUser.channel = targetUser.channel.concat([channel._id]);

    await targetUser.save();
    await channel.save();

    return res.json({success: true});


});

// delete specific user from channel
router.delete('/channel/:channelId/:userId', auth.required, async function(req, res, next){
    var channel = await Channel.findById(req.channelId).exec();
    var targetUser = await User.findById(req.userId).exec();

    if (channel && targetUser){

        if (!channel.isCreator(req.user.id) && !channel.isMember(req.user.id) && !channel.isMember(targetUser._id)){
            return res.sendStatus(401);
        }

        if(!targetUser){
            return res.status(422).json({success: false, errors: {user: "Invalid request"}});
        }

        if (channel.isMember(req.user.id) && req.user.id != targetUser._id){
            return res.sendStatus(401);
        }

        channel.members.splice(channel.members.indexOf(targetUser._id), 1)
        targetUser.channel.splice(targetUser.channel.indexOf(channel._id), 1)
        channel.markModified('members');
        targetUser.markModified('channel');

        channel.key = generateString(12);

        await targetUser.save();
        await channel.save();

        return res.json({success: true});

    } else {
        return res.status(422).json({success: false, errors: {user: "Invalid request"}});
    }
});

// delete channel
router.delete('/channel/:channelId', auth.required, async function(req, res, next){
    var channel = await Channel.findById(req.channelId).exec();

    if(channel){
        if(!channel.isCreator(req.user.id)){
            return res.sendStatus(401);
        }

        channel.visible = false;
        await channel.save();
        return res.json({success: true});
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
