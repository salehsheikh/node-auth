"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { user ,loading: authLoading} = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null);

 useEffect(() => {
    axios.defaults.withCredentials = true;
    if (user && !authLoading) {
      console.log('Fetching posts for user:', user.email);
      fetchPosts();
    }
  }, [user, authLoading]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request to:', `${backend_url}/api/posts`);
      const { data } = await axios.get(`${backend_url}/api/posts`, {
        withCredentials: true,
      });
      console.log('Fetched posts:', data);
      setPosts(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load posts';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch posts error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        // Redirect to login on unauthorized
        window.location.href = '/login?error=session_expired';
      }
    } finally {
      setIsLoading(false);
    }
  };
console.log("usre in postcontext",user)
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

    // Check what the API actually returns
    console.log("API response for addComment:", data);

    // If the API returns the entire post with populated comments
    if (data.comments && data.comments.length > 0) {
      // Find the newly added comment (usually the last one)
      const newComment = data.comments[data.comments.length - 1];
      
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: data.comments } // Use all comments from API
            : p
        )
      );
    } else {
      // If API returns something else, fall back to your current approach
      const newComment = {
        ...data,
        text,
        user: {
          _id: user._id,
          userName: user.userName,
          profileImg: user.profileImg,
          isSubscribed: user.isSubscribed,
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
    }

    toast.success("Comment added");
  } catch (err) {
    toast.error("Failed to add comment");
    console.error("Add comment error:", err.response?.data || err.message);
  }
};
const updateComment = async (postId, commentId, text) => {
  try {
    const { data } = await axios.put(
      `${backend_url}/api/posts/${postId}/comments/${commentId}`,
      { text }
    );
    
    // If the API returns the entire updated post
    if (data.comments) {
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? data : post))
      );
    } 
    // If the API returns only the updated comment
    else {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId
                    ? { ...comment, text: data.text }
                    : comment
                ),
              }
            : post
        )
      );
    }
    
    toast.success("Comment updated");
  } catch (err) {
    toast.error("Failed to update comment");
    console.error("Update comment error:", err.response?.data || err.message);
  }
};

 const likePost = async (id) => {
  try {
    const { data } = await axios.post(`${backend_url}/api/posts/${id}/like`);
    
    setPosts((prev) =>
      prev.map((post) =>
        post._id === id
          ? {
              ...post, // Keep all existing post data
              likes: data.likes, // Only update the likes array
              
            }
          : post
      )
    );
  } catch (err) {
    toast.error("Failed to like post");
    console.error("Like post error:", err.response?.data || err.message);
  }
};

  

  

  const deleteComment = async (postId, commentId) => {
  try {
    await axios.delete(
      `${backend_url}/api/posts/${postId}/comments/${commentId}`
    );
    
    // Properly update the state by filtering out the deleted comment
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: post.comments.filter(comment => comment._id !== commentId)
            }
          : post
      )
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
