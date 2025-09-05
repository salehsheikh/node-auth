import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
         ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment', 'mention', ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemType'
  },
  itemType: {
    type: String,
    enum: ['Post', 'Comment', 'Story', 'User', ],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

const Notification= mongoose.model('Notification', notificationSchema);
export default Notification;
   