// src/hooks/useFollow.js
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useFollow = (targetUserId) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check follow status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || !targetUserId) return;
      try {
        const res = await axios.get(
          `${backend_url}/api/follow/check/${targetUserId}`,
          { withCredentials: true }
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    fetchStatus();
  }, [targetUserId, user]);

  // Follow user
  const follow = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await axios.post(`${backend_url}/api/follow/${targetUserId}`, {}, { withCredentials: true });
      setIsFollowing(true);
    } catch (err) {
      console.error("Follow error:", err);
    }
    setLoading(false);
  };

  // Unfollow user
  const unfollow = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await axios.delete(`${backend_url}/api/follow/${targetUserId}`, { withCredentials: true });
      setIsFollowing(false);
    } catch (err) {
      console.error("Unfollow error:", err);
    }
    setLoading(false);
  };

  return { isFollowing, follow, unfollow, loading };
};
