"use client"
import FollowButton from "@/app/components/FollowButton";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMapPin, FiUsers, FiUser, FiCalendar, FiMail } from "react-icons/fi";
import Image from "next/image";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!id || id === 'undefined') {
          setError("Invalid user ID");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${backend_url}/api/profile/${id}`, { 
          withCredentials: true 
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
console.log("profile", profile);

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-gray-400 text-4xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <Image
                  src={profile.profileImg }
                  alt={profile.userName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  
                />
              </div>
             
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profile.userName}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                      <FiMapPin className="text-sm" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                </div>
                <FollowButton userId={profile._id} />
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.followingCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.postsCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        </div>
      )}

      {/* Details Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
          <div className="space-y-3">
            {profile.email && (
              <div className="flex items-center gap-3 text-gray-700">
                <FiMail className="text-gray-400" />
                <span className="text-sm">{profile.email}</span>
              </div>
            )}
            {profile.createdAt && (
              <div className="flex items-center gap-3 text-gray-700">
                <FiCalendar className="text-gray-400" />
                <span className="text-sm">
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            )}
            {profile.role && (
              <div className="flex items-center gap-3 text-gray-700">
                <FiUser className="text-gray-400" />
                <span className="text-sm capitalize">{profile.role}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['Posts', 'Media', 'Likes', 'Highlights'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}
            {activeTab === 'media' && (
              <div className="text-center py-12">
                <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No media yet</p>
              </div>
            )}
            {activeTab === 'likes' && (
              <div className="text-center py-12">
                <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No likes yet</p>
              </div>
            )}
            {activeTab === 'highlights' && (
              <div className="text-center py-12">
                <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No highlights yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;