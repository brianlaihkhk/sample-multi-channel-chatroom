var mongoose = require('mongoose');

var ChannelSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, required: [true, "can't be blank"], index: true},
  description: String,
  private : Boolean,
  visible : Boolean,
  key : String,
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
    response = this.toJson(user);
    if ((!this.private || this.isCreator(user) || this.isMember(user)) && this.visible ){
      response.creator = this.creator.toJson(),
      response.members = this.members.map( user => user.toJson());
    }
    return response;
};

ChannelSchema.methods.getKey = function(user){
    response = {}
    if ((!this.private || this.isCreator(user) || this.isMember(user)) && this.visible ){
      response.key = this.key
    }
    return response;
};

ChannelSchema.methods.isCreator = function(user){
    return (user._id == this.creator._id) ? true : false;
};

ChannelSchema.methods.isMember = function(user){
    return (this.members.indexOf(user._id) > -1) ? true : false;
};

mongoose.model('Channel', ChannelSchema);
