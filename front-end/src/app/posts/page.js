"use client";
import { useEffect, useState } from "react";
import { usePosts } from "../contexts/PostContext";
import Image from "next/image"; // Use Next.js Image for optimized image rendering
import { PiPencilSimpleLineThin } from "react-icons/pi"; 
import { TbArrowBackUp } from "react-icons/tb"; 
import { useAuth } from "../contexts/AuthContext";
import Story from "../components/Story";
import { FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";

export default function PostsPage() {
  const { posts, fetchPosts, createPost, likePost, addComment, updateComment, deleteComment, updatePost, deletePost } = usePosts();
  const { user } = useAuth(); 
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingComment, setEditingComment] = useState({});
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


  // Save edited comment
const handleSaveComment = async (postId, commentId) => {
  if (!editingComment[commentId]) return;
  
  console.log("Post ID:", postId);
  console.log("Comment ID:", commentId);
  console.log("Are they the same?", postId === commentId);
  console.log("Editing text:", editingComment[commentId]);
  
  try {
    await updateComment(postId, commentId, editingComment[commentId]);
    setEditingComment((prev) => {
      const copy = { ...prev };
      delete copy[commentId];
      return copy;
    });
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
    <div className="max-w-2xl mx-auto p-6 bg-black text-white">
      {/* Back Button and Header */}
      <div className="flex gap-2 items-start mb-6">
        <TbArrowBackUp className="size-6 cursor-pointer" onClick={() => window.history.back()} />
        <div>
          <h2 className="text-2xl font-semibold">Posts</h2>
          <p className="text-sm text-white/70 font-normal">Share your thoughts and ideas</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-500/20 text-red-300 rounded-lg mb-4">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-500/20 text-green-300 rounded-lg mb-4">{success}</div>
      )}
<Story/>
      {/* Post Creation Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-[#FDDE4514] p-4 rounded-[20px] bg-glass">
        <div className="flex items-center gap-4 mb-4">
          {user?.profileImg && user.profileImg !== "" ? (
            <Image
              src={user.profileImg}
              alt="User Profile"
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white/70 text-sm">
                {user?.userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <p className="text-lg font-semibold">{user?.userName || "User"}</p>
         {user?.isSubscribed && (
      <FaCheckCircle
      
      className="text-blue-500 text-sm" title="Verified Subscriber" />
    )}
        </div>
        <textarea
          className="w-full rounded-[10px] bg-white/20 p-3.5 font-medium resize-none min-h-[100px]"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center space-x-4">
          <div className="relative cursor-pointer group">
            <div className="bg-[#C5A713] h-12 rounded-[10px] flex items-center justify-center px-3 group-hover:bg-[#e0c234] transition">
              <PiPencilSimpleLineThin className="size-5" />
              <span className="ml-2 text-sm font-medium">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
            </div>
          </div>
          {image && (
            <div className="w-32 h-32 bg-white/20 rounded-md overflow-hidden">
              <Image
                src={URL.createObjectURL(image)} // Local image preview
                alt="Image Preview"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#C5A713] hover:bg-[#e0c234] transition"}`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-[#FDDE4514] p-6 rounded-[20px] bg-glass space-y-4">
            {/* Post Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {post.user?.profileImg && (
                  <Image
                    src={post.user.profileImg}
                    alt={post.user?.userName || "User profile"}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                )}
                <h2 className="font-semibold text-lg">{post.user?.userName}</h2>
                {post.user?.isSubscribed && (
        <FaCheckCircle className="text-blue-500 text-sm" title="Verified Subscriber" />
      )}
              </div>
              <span className="text-sm text-white/70">{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            {/* Editable Post Text */}
            {editingPost[post._id] !== undefined ? (
              <div className="mt-2 flex space-x-2">
                <input
                  className="flex-1 rounded-[10px] bg-white/20 p-3.5 font-medium"
                  value={editingPost[post._id]}
                  onChange={(e) =>
                    setEditingPost((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => handleSavePost(post._id)}
                  className="bg-[#C5A713] text-white px-4 py-2 rounded-lg hover:bg-[#e0c234] transition"
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
                  className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="mt-2 text-white/90">{post.text}</p>
            )}

            {post.image && (
              <Image
                src={post.image}
                alt="Post Image"
                width={672}
                height={320}
                priority
                className="mt-3 rounded-lg max-h-80 object-cover"
              />
            )}

            {/* Post Actions (Like, Edit, Delete) */}
            <div className="mt-4 flex space-x-6 text-white/70">
              <button
                onClick={() => likePost(post._id)}
                className="flex items-center space-x-2 hover:text-[#C5A713] transition"
              >
                <span>❤️</span>
                <span>{post.likes?.length || 0}</span>
              </button>
              {post.isOwner && (
                <>
                  <button
                    onClick={() =>
                      setEditingPost((prev) => ({
                        ...prev,
                        [post._id]: post.text,
                      }))
                    }
                    className="hover:text-[#C5A713] transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-4 border-t border-white/20 pt-4 space-y-4">
              <h3 className="font-semibold mb-2">Comments</h3>
              {post.comments?.map((comment) => (
                <div key={comment._id} className="space-y-2">
                  {/* Edit Mode for Comment */}
                  {editingComment[comment._id] !== undefined ? (
                    <div className="flex items-center space-x-2">
                      <input
                        className="flex-1 rounded-[10px] bg-white/20 p-3.5 font-medium"
                        value={editingComment[comment._id]}
                        onChange={(e) =>
                          setEditingComment((prev) => ({
                            ...prev,
                            [comment._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleSaveComment(post._id, comment._id)}
                        className="bg-[#C5A713] text-white px-3 py-1 rounded-lg hover:bg-[#e0c234] transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() =>
                          setEditingComment((prev) => {
                            const copy = { ...prev };
                            delete copy[comment._id];
                            return copy;
                          })
                        }
                        className="bg-gray-300 text-black px-3 py-1 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* View Mode for Comment */
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {comment.user?.profileImg && (
                          <Image
                            src={comment.user.profileImg}
                            alt={comment.user?.userName || "User profile"}
                            width={32}
                            height={32}
                            className="size-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{comment.user?.userName || "Unknown"}:</span>
                          {comment.user?.isSubscribed && (
        <FaCheckCircle className="text-blue-500 text-xs" title="Verified Subscriber" />
      )}
                          <span className="ml-1">{comment.text}</span>
                        </div>
                      </div>

                      {/* Edit/Delete Comment Buttons */}
                      {comment.isOwner && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setEditingComment((prev) => ({
                                ...prev,
                                [comment._id]: comment.text,
                              }))
                            }
                            className="text-[#C5A713] text-sm hover:text-[#e0c234] transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment(post._id, comment._id)}
                            className="text-red-400 text-sm hover:text-red-500 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* Add Comment */}
              <div className="flex items-center space-x-3 mt-4">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 rounded-[10px] bg-white/20 p-3.5 font-medium"
                  value={commentInputs[post._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => handleAddComment(post._id)}
                  className="bg-[#C5A713] text-white px-4 py-2 rounded-lg hover:bg-[#e0c234] transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
