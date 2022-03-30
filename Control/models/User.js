var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9\-_]+$/, 'is invalid'], index: true},
  guest: Boolean,
  hash: String,
  salt: String,
  channel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }]
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toJson = function(){
  return {
    id: this._id,
    username: this.username,
    token: this.generateJWT()
  };
};

UserSchema.methods.toSelfJson = function(){
  return {
    id: this._id,
    username: this.username,
    token: this.generateJWT(),
    channel: this.channel
  };
};

UserSchema.methods.toProfileJSONFor = function(){
  return {
    username: this.username
  };
};

mongoose.model('User', UserSchema);
