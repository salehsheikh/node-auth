"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const StoryContext = createContext();
export const StoryProvider = ({ children }) => {
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [highlights, setHighlights] = useState([]);
  
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    if (user) {  
      fetchStories();
      fetchHighlights();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${backend_url}/api/stories`);
      if (data.success) {
        setStories(data.stories);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error("Failed to load stories");
        console.error("fetch stories error", err.response?.data || err.message);
      }
    }
  };

  const createStory = async (formData) => {
    try {
      const { data } = await axios.post(`${backend_url}/api/stories`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newStory = {
        ...data,
        user: {
          _id: user._id,
          userName: user.userName,
          profileImg: user.profileImg,
        },
        likes: [],
        viewers: [],
        isOwner: true,
      };
      setStories((prev) => [newStory, ...prev]);
      toast.success("Story created");
    } catch (err) {
      toast.error("Failed to Create story");
      console.error("Create story error", err.response?.data || err.message);
    }
  };

  const toggleLikeStory = async (id) => {
    try {
      const { data } = await axios.put(`${backend_url}/api/stories/${id}/like`);
      setStories((prev) =>
        prev.map((story) =>
          story._id === id
            ? { ...story, ...data, user: story.user }
            : story
        )
      );
    } catch (err) {
      toast.error("Failed to like story");
      console.error("Like story error:", err.response?.data || err.message);
    }
  };

  const viewStory = async (id) => {
    try {
      const { data } = await axios.put(`${backend_url}/api/stories/${id}/view`);
      if (data.success) {
        setStories((prev) =>
          prev.map((story) =>
            story._id === id ? { ...story, viewers: data.viewers } : story
          )
        );
      }
    } catch (err) {
      toast.error("Failed to view story");
      console.error("View story error:", err.response?.data || err.message);
    }
  };
const deleteStory = async (id) => {
  try {
    // Delete the story only
    await axios.delete(`${backend_url}/api/stories/${id}`);
    
   
    setStories((prev) => prev.filter((s) => s._id !== id));
    
    toast.success("Story deleted");
  } catch (err) {
    toast.error("Failed to delete story");
    console.error("Delete story error:", err.response?.data || err.message);
  }
};

  const addToHighlights = async (id, title = "Highlights") => {
    try {
      const { data } = await axios.post(
        `${backend_url}/api/stories/${id}/highlight`,
        { title },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (data.success) {
        await fetchHighlights();
        toast.success("Added to highlights!");
        return data.highlight;
      }
    } catch (err) {
      console.error("Error adding to highlights:", err.response?.data || err.message);
      toast.error("Failed to add to highlights");
      throw err;
    }
  };

 const fetchHighlights = async () => {
  try {
    const { data } = await axios.get(`${backend_url}/api/stories/highlights`);
    if (data.success) {
      setHighlights(data.highlights);
    }
  } catch (err) {
    console.error("Error fetching highlights:", err);
  }
};

const removeFromHighlights = async (storyId) => {
  try {
    // Find the highlight ID first
   const highlight = highlights.find(h => h.story === storyId);
    
    if (!highlight) {
      toast.error("Highlight not found");
      return;
    }

    const { data } = await axios.delete(
      `${backend_url}/api/stories/${storyId}/highlight`
    );
    
    if (data.success) {
     
      setHighlights((prev) => prev.filter((h) => h._id !== highlight._id));
      toast.success("Removed from highlights!");
    }
  } catch (err) {
    console.error("Error removing from highlights:", err);
    toast.error("Failed to remove from highlights");
  }
};
  // Helper function to find highlight ID by story ID
  const findHighlightIdByStoryId = (storyId) => {
    const highlight = highlights.find(h => h.story === storyId);
    return highlight ? highlight._id : null;
  };



  return (
    <StoryContext.Provider
      value={{
        stories,
        highlights,
        fetchStories,
        createStory,
        toggleLikeStory,
        viewStory,
        deleteStory,
        addToHighlights,
        fetchHighlights,
        removeFromHighlights,
        findHighlightIdByStoryId,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStories = () => useContext(StoryContext);