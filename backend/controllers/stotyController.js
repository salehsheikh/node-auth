import Story from "../modals/Story.js";
import cloudinary from "../utils/cloudinary.js";

export const createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const story = await Story.create({
      user: req.user.id,
      image: req.file.path, 
      imageId: req.file.filename,
      caption: req.body.caption || "",
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    });

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStories=async(req,res)=>{
    try{
        const stories=await Story.find()
        .populate("user","userName profileImg")
        .populate("likes","userName")
        .populate("viewers","userName")
        .sort({createdAt:-1});
        res.json({success:true, stories});
    }catch(err){
        res.status(500).json({success:false,message:err.message});
    }
};
export const toggleLikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.likes.includes(req.user.id)) {
      story.likes = story.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      story.likes.push(req.user.id);
    }

    await story.save();
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const viewStory=async(req,res)=>{
    try{
        const story =await Story.findById(req.params.id);
        if(!story) return res.status(404).json({success:false,message:"Story not found"});
        if(!story.viewers.includes(req.user._id)){
            story.viewers.push(req.user._id);
            await story.save();
        }
        res.json({success:true, viewers: story.viewers});
    } 
    catch (err) {
    res.status(500).json({ success: false, message: err.message });
}
};

export const deleteStory=async(req,res)=>{
    try{
        const story=await Story.findById(req.params.id);
        if(!story) return res.status(404).json({success:false,message:"Story not found"});
        if(story.user.toString() !== req.user.id) return res.status(403).json({message:"Not Authorized"});
        await cloudinary.uploader.destroy(story.imageId);
        await story.deleteOne();
        res.json({message:"Story Deleted"});
    } catch(err){
      res.status(500).json({message:err.message});
    }
};