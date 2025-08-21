"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { user } = useAuth(); // ✅ get logged-in user
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.defaults.withCredentials = true;
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${backend_url}/api/posts`);
      setPosts(data);
    } catch (err) {
      toast.error("Failed to load posts");
      console.error("Fetch posts error:", err.response?.data || err.message);
    }
  };

 // ✅ Fix createPost
const createPost = async (formData) => {
  try {
    const { data } = await axios.post(`${backend_url}/api/posts`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newPost = {
      ...data,
      user: {
        _id: user._id,
        userName: user.userName,
        profileImg: user.profileImg,
      },
      isOwner: true, // <-- Ensure edit/delete shows instantly
    };

    setPosts((prev) => [newPost, ...prev]);
    toast.success("Post created");
  } catch (err) {
    toast.error("Failed to create post");
    console.error("Create post error:", err.response?.data || err.message);
  }
};

// ✅ Fix addComment
const addComment = async (postId, text) => {
  try {
    const { data } = await axios.post(
      `${backend_url}/api/posts/${postId}/comments`,
      { text }
    );

    const newComment = {
      ...data,
      text, // ✅ force set text from user input
      user: {
        _id: user._id,
        userName: user.userName,
        profileImg: user.profileImg,
      },
      isOwner: true,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    toast.success("Comment added");
  } catch (err) {
    toast.error("Failed to add comment");
    console.error("Add comment error:", err.response?.data || err.message);
  }
};


  const likePost = async (id) => {
    try {
      const { data } = await axios.post(`${backend_url}/api/posts/${id}/like`);
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (err) {
      toast.error("Failed to like post");
      console.error("Like post error:", err.response?.data || err.message);
    }
  };

  

  const updateComment = async (postId, commentId, text) => {
    try {
      const { data } = await axios.put(
        `${backend_url}/api/posts/${postId}/comments/${commentId}`,
        { text }
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data : p))
      );
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Failed to update comment");
      console.error("Update comment error:", err.response?.data || err.message);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      const { data } = await axios.delete(
        `${backend_url}/api/posts/${postId}/comments/${commentId}`
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data : p))
      );
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete comment");
      console.error("Delete comment error:", err.response?.data || err.message);
    }
  };

  const updatePost = async (postId, text) => {
    try {
      const { data } = await axios.put(`${backend_url}/api/posts/${postId}`, {
        text,
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data : p))
      );
      toast.success("Post updated");
    } catch (err) {
      toast.error("Failed to update post");
      console.error("Update post error:", err.response?.data || err.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`${backend_url}/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
      console.error("Delete post error:", err.response?.data || err.message);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        fetchPosts,
        createPost,
        likePost,
        addComment,
        updateComment,
        deleteComment,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);
