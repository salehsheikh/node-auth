"use client";
import React, { useState, useEffect } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { PiPencilSimpleLineThin } from "react-icons/pi";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const InputField = ({ label, type = "text", placeholder, value, onChange, name, disabled = false }) => (
  <div className="w-full md:w-1/2 text-sm text-white">
    <label className="block mb-2">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`h-12 rounded-[10px] w-full bg-white/20 !px-3.5 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
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
      formData.userName !== user.userName ||
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

    try {
      setLoading(true);
      const result = await uploadProfileImage(file); 
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
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
    <div className="text-white space-y-6 !bg-black p-4">
      <div className="flex gap-2 items-start">
        <TbArrowBackUp className="size-6 cursor-pointer" onClick={() => window.history.back()} />
        <div>
          <h2 className="text-2xl font-semibold">AI Settings</h2>
          <p className="text-sm text-white/70 font-normal">
            Configure your video generation preferences and API connections
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/20 text-green-300 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col xl:flex-row gap-[19px]">
          <div className="rounded-[20px] flex-1 bg-[#FDDE4514] bg-glass !px-5 py-[22px] space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer group">
                <Image
                  src={user.profileImg || ''}
                  alt="user"
                  width={76}
                  height={76}
                  className="size-[76px] rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-[#C5A713] size-[26px] rounded-full flex items-center justify-center group-hover:bg-[#e0c234] transition">
                  <PiPencilSimpleLineThin className="size-[18px]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <p className="text-2xl font-semibold">{user.userName}</p>
                <p className="text-sm text-white/70 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col md:flex-row gap-3.5">
                <InputField 
                  label="Full Name" 
                  name="userName"
                  placeholder="Enter your name" 
                  value={formData.userName}
                  onChange={handleChange}
                />
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className="flex flex-col md:flex-row gap-3.5">
                <InputField 
                  label="Role" 
                  name="role"
                  placeholder="Your role" 
                  value={formData.role}
                  onChange={handleChange}
                  disabled
                />
                <InputField 
                  label="Location" 
                  name="location"
                  placeholder="Enter your location" 
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="text-sm text-white">
              <label className="block mb-2">Bio</label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-[10px] bg-white/20 !px-3.5 !py-3.5 font-medium resize-none min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-white/50 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-6 py-2 rounded-lg font-medium ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-[#C5A713] hover:bg-[#e0c234] transition'
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Wrap the component with ProtectedRoute
export default function ProtectedUserSettings() {
  return (
    <ProtectedRoute>
      <UserSettings />
    </ProtectedRoute>
  );
}