var mongoose = require('mongoose');
var CryptoJS = require("crypto-js");

var MessageSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: {type: String, required: [true, "can't be blank"]},
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }
}, {timestamps: true, collection: 'Message' });

MessageSchema.methods.toJson = function(){
  return {
    id: this._id,
    creator: this.creator,
    message: this.message,
    channel: this.channel,
    createdAt : this.createdAt
  };
};

MessageSchema.methods.toJson = function(key){
  return {
    id: this._id,
    creator: this.creator,
    message: CryptoJS.AES.encrypt(this.message, key),
    channel: this.channel,
    createdAt : this.createdAt
  };
};


mongoose.model('Message', MessageSchema);
