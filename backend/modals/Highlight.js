import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
  },
  title: {
    type: String,
    required: true,
    default: "Highlights",
  },
 
  image: {
    type: String, // URL of the image
  },
  imageId: {
    type: String, // Cloudinary public_id
  },
  
  userInfo: {
    userName: String,
    profileImg: String,
  }
}, {
  timestamps: true,
});

export default mongoose.model("Highlight", highlightSchema);