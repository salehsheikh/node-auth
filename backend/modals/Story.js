import mongoose from "mongoose";

const storySchema=mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    image:{type:String, required:true},
     imageId: { type: String, required: true }, 
    caption :{type:String},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    viewers:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    expiresAt:{type:Date, required:true},
},
{ timestamps:true }
);
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('Story', storySchema);