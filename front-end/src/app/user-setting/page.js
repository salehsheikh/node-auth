"use client";
import React, { useState, useEffect } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { PiPencilSimpleLineThin } from "react-icons/pi";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { FaCheckCircle, FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaInfoCircle } from "react-icons/fa";
import FollowButton from "../components/FollowButton";

const InputField = ({ label, type = "text", placeholder, value, onChange, name, disabled = false, icon }) => (
  <div className="w-full text-sm">
    <label className="block mb-2 text-gray-300 font-medium">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-12 rounded-xl w-full bg-gray-800 border border-gray-700 pl-10 pr-4 font-medium text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-600'
        }`}
      />
    </div>
  </div>
);

const UserSettings = () => {
  const { user, updateProfile, uploadProfileImage } = useAuth();
 
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    role: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        email: user.email || '',
        role: user.role || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const hasChanges = 
     
      formData.location !== user.location ||
      formData.bio !== user.bio;

    if (!hasChanges) {
      setLoading(false);
      setSuccess('No changes to save');
      setTimeout(() => setSuccess(''), 2000);
      return;
    }

    try {
      const response = await updateProfile(formData);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const result = await uploadProfileImage(file); 
      if (result.success) {
        setSuccess('Profile picture updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        setImagePreview('');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <TbArrowBackUp className="size-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Profile Settings
            </h2>
            <p className="text-gray-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-6 text-gray-200">Profile Information</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="relative">
                    <Image
                      src={imagePreview || user?.profileImg || '/default-avatar.png'}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="size-24 md:size-32 rounded-2xl object-cover border-2 border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PiPencilSimpleLineThin className="size-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Click to upload new photo</p>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-semibold">{user?.userName}</h4>
                  {user?.isSubscribed && (
                    <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-full">
                      <FaCheckCircle className="text-blue-400 text-sm" />
                      <span className="text-blue-300 text-xs">Verified</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 capitalize">{user?.role}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Account Details</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Username" 
                name="userName"
                placeholder="Enter your username" 
                value={formData.userName}
                onChange={handleChange}
                disabled
                icon={<FaUser className="text-gray-400" size={16} />}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled
                icon={<FaEnvelope className="text-gray-400" size={16} />}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Role" 
                name="role"
                placeholder="Your role" 
                value={formData.role}
                onChange={handleChange}
                disabled
                icon={<FaBriefcase className="text-gray-400" size={16} />}
              />
              <InputField 
                label="Location" 
                name="location"
                placeholder="Enter your location" 
                value={formData.location}
                onChange={handleChange}
                icon={<FaMapMarkerAlt className="text-gray-400" size={16} />}
              />
            </div>

            {/* Bio Textarea */}
            <div className="space-y-2">
              <label className="block text-gray-300 font-medium">Bio</label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <FaInfoCircle className="text-gray-400" size={16} />
                </div>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-10 pr-4 py-3 font-medium text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[120px] hover:border-gray-600"
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-gray-400">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Changes...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
       
      </div>
    </div>
  );
};

export default function ProtectedUserSettings() {
  return (
    <ProtectedRoute>
      <UserSettings />
    </ProtectedRoute>
  );
}