// src/components/Suggestions.js
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import FollowButton from "./FollowButton";
import { useAuth } from "../contexts/AuthContext";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${backend_url}/api/follow/suggestions`, {
          withCredentials: true,
        });
        setSuggestions(res.data.users || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  if (loading) return <p className="text-gray-500">Loading suggestions...</p>;

  if (suggestions.length === 0)
    return <p className="text-gray-500">No suggestions right now.</p>;

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">People You May Know</h3>
      <div className="space-y-4">
        {suggestions.map((person) => (
          <div
            key={person._id}
            className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
          >
            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <img
                src={person.profileImg || "/default-avatar.png"}
                alt={person.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-black">{person.userName}</p>
                {person.isVerified && (
                  <span className="text-xs text-blue-500">✔ Verified</span>
                )}
              </div>
            </div>

            {/* Follow Button */}
            <FollowButton targetUserId={person._id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
