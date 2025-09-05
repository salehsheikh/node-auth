"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const FollowButton = ({ userId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || !userId) return;
      try {
        const res = await axios.get(
          `${backend_url}/api/follow/check/${userId}`,
          { withCredentials: true }
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
        setError("Failed to check follow status");
      }
    };
    
    fetchStatus();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user) {
      setError("Please login to follow users");
      return;
    }

    if (!userId) {
      setError("Invalid user ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await axios.delete(`${backend_url}/api/follow/${userId}`, { 
          withCredentials: true 
        });
        setIsFollowing(false);
      } else {
        await axios.post(`${backend_url}/api/follow/${userId}`, {}, { 
          withCredentials: true 
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow action error:", err);
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user._id === userId) return null;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
          isFollowing
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
      {error && (
        <div className="mt-1 text-red-500 text-xs">{error}</div>
      )}
    </div>
  );
};

export default FollowButton;