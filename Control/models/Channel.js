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

ChannelSchema.methods.toJson = function(){
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    private: this.private
  };
};


ChannelSchema.methods.getChannel = function(userId){
    response = this.toJson();
    if ((!this.private || this.isCreator(userId) || this.isMember(userId)) && this.visible ){
      response.creator = this.creator,
      response.members = this.members;
    }
    return response;
};

ChannelSchema.methods.getKey = function(userId){
    response = {}
    if ((!this.private || this.isCreator(userId) || this.isMember(userId)) && this.visible ){
      response.key = this.key
    }
    return response;
};

ChannelSchema.methods.isCreator = function(userId){
    return (userId == this.creator._id) ? true : false;
};

ChannelSchema.methods.isMember = function(userId){
    return (this.members.indexOf(userId) > -1) ? true : false;
};

mongoose.model('Channel', ChannelSchema);
