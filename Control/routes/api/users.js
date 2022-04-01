var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/user/:userId', auth.required, async function(req, res, next){
    var targetUser = await User.findById(req.userId).exec();

    if(!targetUser){
      return res.sendStatus(401);
    }
    return res.json({user: targetUser.toJson()});

});

router.get('/user', auth.required, async function(req, res, next){
  var user = req.user;
  var requestUser = await User.findById(user.id).exec();

  if (requestUser){
    return res.json({user: requestUser.toSelfJson()});
  } else {
    return res.status(422).json({errors: {user: "invalid request"}});
  }
});

router.put('/user', auth.required, async function(req, res, next){
  var user = req.user;
  var requestUser = await User.findById(user.id).exec();

  // only update fields that were actually passed...
  if(typeof req.body.username !== 'undefined'){
    requestUser.username = req.body.username;
  }

  if(typeof req.body.password !== 'undefined'){
    requestUser.setPassword(req.body.password);
  }

  if(typeof req.body.bio !== 'undefined'){
    requestUser.bio = req.body.bio;
  }

  await requestUser.save();
  return res.json({user: requestUser.getJwt()});

});

router.post('/login', function(req, res, next){
  if(!req.body.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.getJwt()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/user', function(req, res, next){
  var user = new User();

  user.username = req.body.username;
  user.guest = false;
  user.setPassword(req.body.password);

  user.save().then(function(){
    return res.json({user: user.getJwt()});
  }).catch(next);
});

router.post('/guest', function(req, res, next){
  var user = new User();

  user.username = 'guest-' + generateString(6);
  user.guest = true;
  user.setPassword(generateString(12));

  user.save().then(function(){
    user.token = user.generateJWT();
    return res.json({user: user.getJwt()});
  }).catch(next);
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
