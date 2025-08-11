"use client";
import { useEffect, useState } from "react";
import { usePosts } from "../contexts/PostContext";

export default function PostsPage() {
  const {
    posts,
    fetchPosts,
    createPost,
    likePost,
    addComment,
    updateComment,
    deleteComment,
    updatePost,
    deletePost,
  } = usePosts();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editingPost, setEditingPost] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  // Create new post
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text && !image) return;
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);
    createPost(formData);
    setText("");
    setImage(null);
  };

  // Add new comment
  const handleAddComment = (postId) => {
    if (!commentInputs[postId]) return;
    addComment(postId, commentInputs[postId]);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  // Save edited comment
  const handleSaveComment = (postId, commentId) => {
    if (!editingComment[commentId]) return;
    updateComment(postId, commentId, editingComment[commentId]);
    setEditingComment((prev) => ({ ...prev, [commentId]: "" }));
  };

  // Save edited post
  const handleSavePost = (postId) => {
    if (!editingPost[postId]) return;
    updatePost(postId, editingPost[postId]);
    setEditingPost((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Post creation form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <textarea
          className="w-full border rounded p-2"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </form>

      {/* Posts feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{post.user?.userName}</h2>
              <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Editable post text */}
            {editingPost[post._id] !== undefined ? (
              <div className="mt-2 flex space-x-2">
                <input
                  className="flex-1 border rounded p-2"
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
                  className="bg-green-500 text-white px-3 rounded"
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
                  className="bg-gray-300 px-3 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="mt-2">{post.text}</p>
            )}

            {post.image && (
              <img
                src={post.image}
                alt=""
                className="mt-3 rounded max-h-80 object-cover"
              />
            )}

            {/* Like + Edit/Delete buttons */}
            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={() => likePost(post._id)}
                className="text-blue-600"
              >
                ❤️ {post.likes?.length || 0}
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
                    className="text-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* Comments section */}
            <div className="mt-4 border-t pt-3">
              <h3 className="font-semibold mb-2">Comments</h3>
              {post.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="flex justify-between items-center mb-2"
                >
                  {editingComment[comment._id] !== undefined ? (
                    <div className="flex space-x-2 w-full">
                      <input
                        className="flex-1 border rounded p-2"
                        value={editingComment[comment._id]}
                        onChange={(e) =>
                          setEditingComment((prev) => ({
                            ...prev,
                            [comment._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() =>
                          handleSaveComment(post._id, comment._id)
                        }
                        className="bg-green-500 text-white px-3 rounded"
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
                        className="bg-gray-300 px-3 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>
                        <span className="font-semibold">
                          {comment.user?.userName}:
                        </span>{" "}
                        {comment.text}
                      </p>
                      {comment.isOwner && (
                        <div className="space-x-2">
                          <button
                            onClick={() =>
                              setEditingComment((prev) => ({
                                ...prev,
                                [comment._id]: comment.text,
                              }))
                            }
                            className="text-green-500 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deleteComment(post._id, comment._id)
                            }
                            className="text-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Add comment input */}
              <div className="flex space-x-2 mt-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 border rounded p-2"
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
                  className="bg-blue-500 text-white px-3 rounded"
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
