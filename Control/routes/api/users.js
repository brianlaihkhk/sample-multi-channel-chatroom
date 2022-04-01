var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/user/:userId', auth.required, function(req, res, next){
  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }
    if(user){

      User.findById(req.userId).then(function(targetUser){
        if(!targetUser){
          return res.sendStatus(401);
        }
        return res.json({user: targetUser.toJson()});
      }).catch(next);

    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.get('/user', auth.required, function(req, res, next){
  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({user: user.toSelfJson()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.put('/user', auth.required, function(req, res, next){
  passport.authenticate('local', {session: false}, function(err, user, info){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }

    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toJson()});
    });
  })(req, res, next);
});

router.post('/login', function(req, res, next){
  if(!req.body.user.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toJson()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/user', function(req, res, next){
  var user = new User();

  user.username = req.body.user.username;
  user.guest = false;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toJson()});
  }).catch(next);
});

router.post('/guest', function(req, res, next){
  var user = new User();

  user.username = 'guest-' + generateString(6);
  user.guest = true;
  user.setPassword(generateString(12));

  user.save().then(function(){
    user.token = user.generateJWT();
    return res.json({user: user.toJson()});
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
