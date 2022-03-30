var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: {type: String, required: [true, "can't be blank"]},
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }
}, {timestamps: true});

ChannelSchema.methods.toJson = function(user){
  return {
    id: this._id,
    creator: this.creator,
    message: this.message,
    channel: this.channel,
    createdAt : this.createdAt
  };
};

mongoose.model('Message', MessageSchema);
