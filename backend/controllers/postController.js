import Post from "../modals/Post.js";
import cloudinary from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
    try {
        let imageUrl = "";
        let imageId = "";
        if (req.file) {
            imageUrl = req.file.path;
            imageId = req.file.filename;
        }
        const post = await Post.create({
            user: req.user.id,
            text: req.body.text,
            image: imageUrl,
            imageId,
        });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message:err.message });
    }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "userName profileImg")
      .populate("comments.user", "userName profileImg")
      .sort({ createdAt: -1 });

   const postsWithOwnership = posts.map((post) => {
  console.log("Comparing:", {
    postUserId: post.user._id.toString(),
    reqUserId: req.user ? req.user._id.toString() : "No user",
  });
  return {
    ...post.toObject(),
    isOwner: req.user ? post.user._id.toString() === req.user._id.toString() : false,
  };
});

    res.json(postsWithOwnership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== req.user.id)
            return res.status(403).json({ message: "Not Authorized" });
        if (req.file) {
            if (post.imageId) {
                await cloudinary.uploader.destroy(post.imageId);

            }
            post.image = req.file.path;
            post.imageId = req.file.filename;
        }
        post.text = req.body.text || post.text;
        const updated = await post.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const deletePost= async(req,res)=>{
    try{
        const post =await Post.findById(req.params.id);
        if (!post) return res.status(403).json({message:"Post not found"});

        if(post.user.toString() !== req.user.id)
            return res.status(403).json({message:"Not Authorized"});
        if(post.imageId){
            await cloudinary.uploader.destroy(post.imageId);

        }
        await post.deleteOne();
        res.json({message:"Post deleted"});
    } catch (err){
       res.status(500).json({message:err.message});
    }
};

export const toggleLike= async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if (!post) return res.status(404).json({message:"Post not found"});
        if (post.likes.includes(req.user.id)){
            post.likes=post.likes.filter((id)=>id.toString() !== req.user.id);
        }else{
            post.likes.push(req.user.id);
        }
        await post.save();
        res.json(post);
    } catch(err){
        res.status(500).json({message:err.message});
    }
};

export const addComment= async (req,res)=>{
    try{
        const {text}=req.body;
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({message:"Post not found"});
        post.comments.push({user:req.user.id, text});
        await post.save();
        res.json(post);

    } catch(err){
        res.status(500).json({message:err.message});
    }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    comment.text = req.body.text || comment.text;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
