var jwt = require('express-jwt');
var secret = require('../config').secret;
var mongoose = require('mongoose');
var User = mongoose.model('User');

function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}


var isRevokedCallback = async function(req, payload, done){

  var requestUser = await User.findById(payload.id).exec();

  if (requestUser.session == payload.session) {
     return done(null, false);
  }

  return done("Token expired or revoked", true);
};


var auth = {
  required: jwt({
    secret: secret,
    userProperty: 'user',
    getToken: getTokenFromHeader,
    isRevoked: isRevokedCallback
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'user',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
