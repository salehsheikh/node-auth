"use client";
import { useEffect, useState } from "react";
import { usePosts } from "../contexts/PostContext";
import Image from "next/image"; // Use Next.js Image for optimized image rendering
import { PiPencilSimpleLineThin } from "react-icons/pi"; 
import { TbArrowBackUp } from "react-icons/tb"; 
import { useAuth } from "../contexts/AuthContext";
import Story from "../components/Story";
import { FaCheckCircle } from "react-icons/fa";
import { FiHeart, FiMessageCircle, FiShare, FiMoreHorizontal, FiEdit, FiTrash2, FiX, FiSend, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from "date-fns";

export default function PostsPage() {
  const { posts, fetchPosts, createPost, likePost, addComment, updateComment, deleteComment, updatePost, deletePost } = usePosts();
  const { user } = useAuth(); 
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingPost, setEditingPost] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post image upload and submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) {
      setError("Please provide text or an image to post.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);
      await createPost(formData);
      setSuccess("Post created successfully!");
      setText("");
      setImage(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

 // Handle adding a comment
const handleAddComment = async (postId) => {
  if (!commentInputs[postId]) return;
  try {
    await addComment(postId, commentInputs[postId]); // wait for backend
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  } catch (err) {
    console.error("Failed to add comment:", err);
  }
};
const startEditComment = (commentId, currentText) => {
  setEditingCommentId(commentId);
  setEditCommentText(currentText);
};

const cancelEditComment = () => {
  setEditingCommentId(null);
  setEditCommentText("");
};

const handleSaveComment = async (postId, commentId) => {
  if (!editCommentText.trim()) return;
  
  try {
    await updateComment(postId, commentId, editCommentText);
    setEditingCommentId(null);
    setEditCommentText("");
  } catch (err) {
    console.error("Failed to update comment:", err);
  }
};



 // Save edited post
const handleSavePost = async (postId) => {
  if (!editingPost[postId]) return;
  try {
    await updatePost(postId, editingPost[postId]);
    setEditingPost((prev) => {
      const copy = { ...prev };
      delete copy[postId]; // ✅ hide edit field
      return copy;
    });
  } catch (err) {
    console.error("Failed to update post:", err);
  }
};


  return (
   <div className="max-w-2xl mx-auto p-4 bg-black text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-black py-3 z-10">
        <button 
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-800 cursor-pointer rounded-full transition"
        >
          <TbArrowBackUp className="size-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Posts</h2>
          <p className="text-sm text-gray-400">Share your thoughts and ideas</p>
        </div>
      </div>

      {/* Post Creation Card */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3 mb-4">
          {user?.profileImg ? (
            <Image
              src={user.profileImg}
              alt="User Profile"
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          ) : (
            <div className="size-11 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{user?.userName || "User"}</p>
              {user?.isSubscribed && (
                <FaCheckCircle className="text-blue-400 text-xs" title="Verified Subscriber" />
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="mt-2">
              <textarea
                className="w-full bg-transparent resize-none placeholder-gray-500 outline-none min-h-[60px]"
                placeholder="What's on your mind?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />
              
              {image && (
                <div className="relative w-32 h-32 bg-gray-800 rounded-xl overflow-hidden mt-3">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Image Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                  >
                    <FiX className="text-white text-xs" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer p-2 hover:bg-gray-800 rounded-full transition">
                    <FiImage className="text-gray-400 text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || (!text && !image)}
                  className={`px-4 py-2 rounded-full font-medium text-sm ${
                    loading || (!text && !image)
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition"
                  }`}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl mb-4 flex items-center">
          <FiX className="mr-2" /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl mb-4">
          {success}
        </div>
      )}

      <Story />

      {/* Posts Feed */}
      <div className="space-y-5">
        {posts.map((post) => (
          <div key={post._id} className="bg-gray-900 rounded-2xl overflow-hidden">
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.user?.profileImg && (
                    <Image
                      src={post.user.profileImg}
                      alt={post.user?.userName || "User profile"}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.user?.userName}</h3>
                      {post.user?.isSubscribed && (
                        <FaCheckCircle className="text-blue-400 text-xs" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {post.isOwner && (
               <div className="relative group">
  <button className="p-1 hover:bg-gray-800 rounded-full cursor-pointer">
    <FiMoreHorizontal className="text-gray-400" />
  </button>

  {/* Dropdown */}
  <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block group-focus-within:block">
    <button
      onClick={() => setEditingPost({ [post._id]: post.text })}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 w-full text-sm cursor-pointer"
    >
      <FiEdit className="text-sm" /> Edit
    </button>
    <button
      onClick={() => deletePost(post._id)}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 w-full cursor-pointer text-sm text-red-400"
    >
      <FiTrash2 className="text-sm" /> Delete
    </button>
  </div>
</div>

                )}
              </div>

              {/* Editable Post Text */}
              {editingPost[post._id] !== undefined ? (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    className="w-full bg-gray-800 rounded-xl p-3 resize-none"
                    value={editingPost[post._id]}
                    onChange={(e) =>
                      setEditingPost((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSavePost(post._id)}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 cursor-pointer rounded-lg text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        setEditingPost((prev) => {
                          const copy = { ...prev };
                          delete copy[post._id];
                          return copy;
                        })
                      }
                      className="flex-1 py-2 bg-gray-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-white/90">{post.text}</p>
              )}
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="w-full max-h-[500px] overflow-hidden">
                <Image
                  src={post.image}
                  alt="Post Image"
                  width={672}
                  height={672}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Post Actions */}

            <div className="p-4 pt-3 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400">
                  <button
                    onClick={() => likePost(post._id)}
                    className={`flex items-center gap-1 transition cursor-pointer ${
                      post.likes?.includes(user?._id) 
                        ? 'text-red-500' 
                        : 'hover:text-gray-300'
                    }`}
                  >
                    <FiHeart
                      className={post.likes?.includes(user?._id) ? 'fill-current' : ''}
                    />
                    <span className="text-sm">{post.likes?.length || 0}</span>
                  </button>
                  
                  <button className="flex items-center gap-1 hover:text-gray-300 cursor-pointer">
                    <FiMessageCircle />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </button>
                  
                  <button className="hover:text-gray-300">
                    <FiShare />
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-4 space-y-3">
                {post.comments?.slice(0, 3).map((comment) => (
   <div key={comment._id} className="flex items-start gap-2 group">
  {comment.user?.profileImg && (
    <Image
      src={comment.user.profileImg}
      alt={comment.user?.userName || "User profile"}
      width={32}
      height={32}
      className="size-8 rounded-full object-cover flex-shrink-0"
    />
  )}
  
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm">{comment.user?.userName}</span>
      {comment.user?.isSubscribed && (
        <FaCheckCircle className="text-blue-400 text-xs" />
      )}
    </div>
    
    {/* Edit Comment Input or Display */}
    {editingCommentId === comment._id ? (
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={editCommentText}
          onChange={(e) => setEditCommentText(e.target.value)}
          className="flex-1 bg-gray-800 rounded-lg px-3 py-1 text-sm outline-none"
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSaveComment(post._id, comment._id);
            }
          }}
        />
        <button
          onClick={() => handleSaveComment(post._id, comment._id)}
          className="px-3 py-1 bg-green-600 rounded-lg text-sm hover:bg-green-700 cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={cancelEditComment}
          className="px-3 py-1 bg-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    ) : (
      <p className="text-sm text-gray-300">{comment.text}</p>
    )}
  </div>
  
  {comment.isOwner && editingCommentId !== comment._id && (
    <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
      <button
        onClick={() => startEditComment(comment._id, comment.text)}
        className="p-1 hover:bg-gray-800 rounded"
        title="Edit comment"
      >
        <FiEdit className="text-xs cursor-pointer" />
      </button>
      <button
        onClick={() => deleteComment(post._id, comment._id)}
        className="p-1 hover:bg-gray-800 rounded text-red-400"
        title="Delete comment"
      >
        <FiTrash2 className="text-xs cursor-pointer" />
      </button>
    </div>
  )}
</div>
  ))}

                {/* Add Comment */}
                <div className="flex items-center gap-2 mt-3">
                  {user?.profileImg ? (
                    <Image
                      src={user.profileImg}
                      alt="Your profile"
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-white">
                        {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-gray-800 rounded-full py-2 px-4 pr-10 text-sm outline-none"
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      disabled={!commentInputs[post._id]}
                      className="absolute right-2 top-1/2 transform cursor-pointer -translate-y-1/2 text-gray-400 hover:text-amber-500 disabled:opacity-50"
                    >
                      <FiSend />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
