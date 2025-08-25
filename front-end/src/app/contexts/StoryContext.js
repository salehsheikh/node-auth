"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const StoryContext=createContext();
export const StoryProvider=({children})=>{
     const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    const {user}=useAuth();
    const [stories,setStories]=useState([]);
    useEffect(()=>{
        axios.defaults.withCredentials=true;
        fetchStories();
    },[]);

    const fetchStories=async()=>{
        try{
            const{data}=await axios.get(`${backend_url}/api/stories`);
            if(data.success){
                setStories(data.stories);
            }
        } catch(err){
            toast.error("Failed to load stories");
            console.error("fetch stories error",err.response?.data || err.message);
        }
    };

    const createStory=async(formData)=>{
        try{
            const{data}=await axios.post(`${backend_url}/api/stories`,formData,{
                headers:{"Content-Type":"multipart/form-data"},
            });
            const newStory={
                ...data,
                user:{
                    _id:user._id,
                    userName:user.userName,
                    profileImg:user.profileImg,
                },
                likes:[],
                viewers:[],
                isOwner:true,
            };
            setStories((prev)=>[newStory, ...prev]);
            toast.success("Story created");
        } catch(err){
            toast.error("Failed to Create story");
            console.error("Create story error",err.response?.data || err.message);
        }
    };

  const toggleLikeStory = async (id) => {
  try {
    const { data } = await axios.put(`${backend_url}/api/stories/${id}/like`);
    setStories((prev) =>
      prev.map((story) =>
        story._id === id
          ? { ...story, ...data, user: story.user } // Preserve the user object
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


    const deleteStory= async (id)=>{
        try{
            await axios.delete(`${backend_url}/api/stories/${id}`);
            setStories((prev)=>prev.filter((s)=>s._id !== id));
            toast.success("Story deleted");
        }
        catch (err) {
      toast.error("Failed to delete story");
      console.error("Delete story error:", err.response?.data || err.message);
    }
    };

return(
    <StoryContext.Provider
     value={
        {
            stories,
            fetchStories,
            createStory,
            toggleLikeStory,
            viewStory,
            deleteStory,
        }
     }
     >
        {children}
    </StoryContext.Provider>
);
};
export const useStories=()=>useContext(StoryContext);