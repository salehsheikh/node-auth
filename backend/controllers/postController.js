import Post from "../modals/Post.js";
import cloudinary from "../utils/cloudinary.js";
import asyncHandler from 'express-async-handler'
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
        
        // Populate the post with user data for the notification
        const populatedPost = await Post.findById(post._id)
            .populate("user", "userName profileImg isSubscribed");
        
        // Emit socket notification to all connected clients
        const io = req.app.get('io');
        if (io) {
            io.emit('new-post', {
                message: `${populatedPost.user.userName} created a new post`,
                post: populatedPost
            });
        }
        
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message:err.message });
    }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "userName profileImg isSubscribed")
      .populate("comments.user", "userName profileImg isSubscribed")
      .sort({ createdAt: -1 });

    const postsWithOwnership = posts.map((post) => {
      return {
        ...post.toObject(),
        isOwner: req.user ? post.user._id.toString() === req.user._id.toString() : false,
        comments: post.comments.map((comment) => ({
          ...comment.toObject(),
          isOwner: req.user ? comment.user._id.toString() === req.user._id.toString() : false,
        })),
      };
    });

    res.json(postsWithOwnership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updatePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not Authorized' });
    if (req.file) {
      if (post.imageId) {
        await cloudinary.uploader.destroy(post.imageId);
      }
      post.image = req.file.path;
      post.imageId = req.file.filename;
    }
    post.text = req.body.text || post.text;
    const updated = await post.save();
    // Populate user data in response
    const populatedPost = await Post.findById(req.params.id)
      .populate('user', 'userName profileImg isSubscribed')
      .populate('comments.user', 'userName profileImg isSubscribed');
    res.json({
      ...populatedPost.toObject(),
      isOwner: true,
      comments: populatedPost.comments.map((comment) => ({
        ...comment.toObject(),
        isOwner: comment.user._id.toString() === req.user._id.toString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


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

export const addComment = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user.id, text });
    await post.save();
    const populatedPost = await Post.findById(req.params.id)
      .populate('user', 'userName profileImg isSubscribed')
      .populate('comments.user', 'userName profileImg isSubscribed');
    res.json({
      ...populatedPost.toObject(),
      isOwner: post.user.toString() === req.user._id.toString(),
      comments: populatedPost.comments.map((comment) => ({
        ...comment.toObject(),
        isOwner: comment.user._id.toString() === req.user._id.toString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const updateComment = asyncHandler(async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    comment.text = text;
    comment.updatedAt = Date.now();
    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate('user', 'userName profileImg isSubscribed')
      .populate('comments.user', 'userName profileImg isSubscribed');

    const postWithOwnership = {
      ...populatedPost.toObject(),
      isOwner: req.user ? populatedPost.user._id.toString() === req.user._id.toString() : false,
      comments: populatedPost.comments.map((comment) => ({
        ...comment.toObject(),
        isOwner: req.user ? comment.user._id.toString() === req.user._id.toString() : false,
      })),
    };

    res.json(postWithOwnership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
