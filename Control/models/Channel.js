var mongoose = require('mongoose');

var ChannelSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, required: [true, "can't be blank"], index: true},
  description: String,
  private : Boolean,
  visible : Boolean,
  members : [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true});

ChannelSchema.methods.toJson = function(user){
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    private: this.private
  };
};

ChannelSchema.methods.getChannel = function(user){
    if (!this.private || this.isCreator(user) || this.isMember(user)){
        return {
          creator: this.author.toProfileJSONFor(),
          members: this.members.map( user => user.toProfileJSONFor() )
        };
    }
    throw 'Request rejected. Make sure you have the premission to get channel data.'
};

ChannelSchema.methods.isCreator = function(user){
    return (user._id == this.creator._id) ? true : false;
};

ChannelSchema.methods.isMember = function(user){
    return (user._id in this.members) ? true : false;
};

mongoose.model('Channel', ChannelSchema);
