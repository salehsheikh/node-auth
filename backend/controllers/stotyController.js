import Highlight from "../modals/Highlight.js";
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
  const populatedStory= await Story.findById(story._id)
  .populate ("user", "userName profileImg isSubscribed");

  const io= req.app.get('io');
  if(io){
    io.emit('new-story',{
      message:`${populatedStory.user.userName} created a new story`,
      story:populatedStory
    });
  }
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
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    
    if (story.user.toString() !== req.user.id) return res.status(403).json({ message: "Not Authorized" });
    

    await cloudinary.uploader.destroy(story.imageId);
    await story.deleteOne();
    
    res.json({ message: "Story Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToHighlights = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId).populate("user", "userName profileImg");
    
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const title = req.body?.title || "Highlights";

    let highlight = await Highlight.findOne({ 
      user: req.user._id, 
      story: storyId 
    });
    
    if (!highlight) {
      highlight = await Highlight.create({
        user: req.user._id,
        story: storyId,
        title: title,
        // Save the image info independently
        image: story.image,
        imageId: story.imageId,
        userInfo: {
          userName: story.user.userName,
          profileImg: story.user.profileImg
        }
      });
    }

    res.status(201).json({ success: true, highlight });
  } catch (err) {
    console.error("Error in addToHighlights:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHighlights = async (req, res) => {
  try {
    const highlights = await Highlight.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, highlights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFromHighlights = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const highlight = await Highlight.findOne({ 
      user: req.user._id, 
      story: storyId 
    });
    
    if (!highlight) {
      return res.status(404).json({ message: "Highlight not found" });
    }
    
    await Highlight.findByIdAndDelete(highlight._id);
    
    res.json({ success: true, message: "Removed from highlights" });
  } catch (err) {
    console.error("Error in removeFromHighlights:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
