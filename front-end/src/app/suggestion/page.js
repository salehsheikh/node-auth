// src/components/Suggestions.js
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import FollowButton from "../components/FollowButton";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suggestions");
  const [followersPagination, setFollowersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        
        // Fetch suggestions
        const suggestionsRes = await axios.get(`${backend_url}/api/follow/suggestions`, {
          withCredentials: true,
        });
        setSuggestions(suggestionsRes.data.users || []);
        
        // Fetch followers using your backend endpoint
        try {
          const followersRes = await axios.get(
            `${backend_url}/api/follow/followers/${user._id}?page=1&limit=10`, 
            { withCredentials: true }
          );
          
          // For each follower, check if we follow them back
          const followerUsersWithStatus = await Promise.all(
            followersRes.data.data.map(async (follow) => {
              try {
                // Check if current user follows this follower back
                const followStatusRes = await axios.get(
                  `${backend_url}/api/follow/check/${follow.follower._id}`,
                  { withCredentials: true }
                );
                
                return {
                  _id: follow.follower._id,
                  userName: follow.follower.userName,
                  profileImg: follow.follower.profileImg,
                  isVerified: follow.follower.isVerified,
                  isFollowedByMe: followStatusRes.data.isFollowing
                };
              } catch (error) {
                console.error("Error checking follow status for user:", follow.follower._id, error);
                return {
                  _id: follow.follower._id,
                  userName: follow.follower.userName,
                  profileImg: follow.follower.profileImg,
                  isVerified: follow.follower.isVerified,
                  isFollowedByMe: false
                };
              }
            })
          );
          
          setFollowers(followerUsersWithStatus);
          setFollowersPagination(followersRes.data.pagination);
        } catch (err) {
          console.error("Error fetching followers:", err);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const loadMoreFollowers = async () => {
    if (followersPagination.page >= followersPagination.pages) return;
    
    try {
      const nextPage = followersPagination.page + 1;
      const followersRes = await axios.get(
        `${backend_url}/api/follow/followers/${user._id}?page=${nextPage}&limit=${followersPagination.limit}`, 
        { withCredentials: true }
      );
      
      // For each new follower, check if we follow them back
      const newFollowerUsersWithStatus = await Promise.all(
        followersRes.data.data.map(async (follow) => {
          try {
            const followStatusRes = await axios.get(
              `${backend_url}/api/follow/check/${follow.follower._id}`,
              { withCredentials: true }
            );
            
            return {
              _id: follow.follower._id,
              userName: follow.follower.userName,
              profileImg: follow.follower.profileImg,
              isVerified: follow.follower.isVerified,
              isFollowedByMe: followStatusRes.data.isFollowing
            };
          } catch (error) {
            console.error("Error checking follow status for user:", follow.follower._id, error);
            return {
              _id: follow.follower._id,
              userName: follow.follower.userName,
              profileImg: follow.follower.profileImg,
              isVerified: follow.follower.isVerified,
              isFollowedByMe: false
            };
          }
        })
      );
      
      setFollowers(prev => [...prev, ...newFollowerUsersWithStatus]);
      setFollowersPagination(followersRes.data.pagination);
    } catch (err) {
      console.error("Error loading more followers:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-5 w-full max-w-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 w-full max-w-md">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === "suggestions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("suggestions")}
        >
          People You May Know
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === "followers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("followers")}
        >
          Followers ({followersPagination.total})
        </button>
      </div>

      {activeTab === "suggestions" ? (
        <>
          {suggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No suggestions right now.</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((person) => (
                <div
                  key={person._id}
                  className="flex items-center justify-between gap-3 py-3 border-b last:border-0"
                >
                  {/* Profile Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={person.profileImg || "/default-avatar.png"}
                      alt={person.userName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{person.userName}</p>
                        {person.isVerified && (
                          <span className="text-blue-500 text-sm" title="Verified">
                            ✓
                          </span>
                        )}
                      </div>
                      {person.mutualFollowers > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {person.mutualFollowers} mutual follower{person.mutualFollowers !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Follow Button */}
                  <FollowButton userId={person._id} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {followers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">You don't have any followers yet.</p>
          ) : (
            <>
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div
                    key={follower._id}
                    className="flex items-center justify-between gap-3 py-3 border-b last:border-0"
                  >
                    {/* Follower Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={follower.profileImg || "/default-avatar.png"}
                        alt={follower.userName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{follower.userName}</p>
                          {follower.isVerified && (
                            <span className="text-blue-500 text-sm" title="Verified">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Follows you</p>
                      </div>
                    </div>

                    {/* Follow Button with initial status */}
                    <FollowButton 
                      userId={follower._id} 
                      initialIsFollowing={follower.isFollowedByMe}
                    />
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {followersPagination.page < followersPagination.pages && (
                <button
                  onClick={loadMoreFollowers}
                  className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Load More
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Suggestions;