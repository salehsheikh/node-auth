"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext";
import { FiHeart, FiEye, FiTrash2, FiX, FiPlus } from "react-icons/fi";

const Story = () => {
  const { stories, createStory, toggleLikeStory, deleteStory, viewStory } = useStories();
  const { user, loading: authLoading } = useAuth();

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const viewedStoriesRef = useRef(new Set());

  // --- helpers
  const userIdStr = String(user?._id || "");
  const hasUserLiked = (story) =>
    Array.isArray(story?.likes) &&
    story.likes.some((id) => String(id) === userIdStr);

  // file change -> open create modal
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setIsCreating(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);
    await createStory(formData);
    setCaption("");
    setFile(null);
    setPreview(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setIsCreating(false);
  };

  // mark viewed once per session
  useEffect(() => {
    if (stories.length && user && !authLoading) {
      stories.forEach((story) => {
        if (!story.viewers.includes(user._id) && !viewedStoriesRef.current.has(story._id)) {
          viewStory(story._id);
          viewedStoriesRef.current.add(story._id);
        }
      });
    }
  }, [stories, user, viewStory, authLoading]);

  // keep modal story in sync with context updates (e.g., likes from other places)
  useEffect(() => {
    if (!selectedStory) return;
    const latest = stories.find((s) => s._id === selectedStory._id);
    if (latest) setSelectedStory((prev) => ({ ...prev, ...latest }));
  }, [stories, selectedStory?._id]); // safe optional chaining

  // optimistic like in modal (instant color change)
  const handleToggleLikeInModal = async () => {
    if (!selectedStory || !user) return;
    if (likeLoading) return;

    // local optimistic update
    setSelectedStory((prev) => {
      if (!prev) return prev;
      const already = hasUserLiked(prev);
      const nextLikes = already
        ? prev.likes.filter((id) => String(id) !== userIdStr)
        : [...(prev.likes || []), userIdStr];
      return { ...prev, likes: nextLikes };
    });

    try {
      setLikeLoading(true);
      await toggleLikeStory(selectedStory._id);
    } finally {
      setLikeLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Stories</h2>
        {!isCreating && (
          <label className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full cursor-pointer">
            <FiPlus className="text-white text-xl" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Create Story Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Story</h3>
              <button onClick={handleCancel} className="text-white">
                <FiX size={24} />
              </button>
            </div>

            {preview && (
              <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                <Image src={preview} alt="preview" fill className="object-cover" />
              </div>
            )}

            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg mb-4 text-white placeholder-gray-400"
            />

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Post Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stories.map((story) => (
          <div
            key={story._id}
            className="relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setSelectedStory(story)}
          >
            {/* Thumbnail */}
            <div className="relative w-full h-48">
              <Image src={story.image} alt="story" fill className="object-cover" />
            </div>

            {/* User Info */}
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black bg-opacity-50 px-2 py-1 rounded-full">
              <div className="relative w-6 h-6">
                <Image
                  src={story.user?.profileImg || "/default-avatar.png"}
                  alt="profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <span className="text-xs">{story.user?.userName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            className="absolute top-4 cursor-pointer right-4 text-white z-10"
            onClick={() => setSelectedStory(null)}
          >
            <FiX size={28} />
          </button>

          <div className="relative w-full h-full max-w-md mx-auto">
            <Image src={selectedStory.image} alt="story" fill className="object-contain" />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              {selectedStory.caption && (
                <p className="text-white text-lg mb-3">{selectedStory.caption}</p>
              )}

              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={selectedStory.user?.profileImg || "/default-avatar.png"}
                      alt="profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="text-white font-medium">
                    {selectedStory.user?.userName}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleLikeInModal}
                    disabled={likeLoading}
                    className={`p-2 rounded-full cursor-pointer ${
                      hasUserLiked(selectedStory) ? "text-pink-500" : "text-white"
                    } ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <FiHeart size={20} />
                  </button>

                  {user && selectedStory.user && String(selectedStory.user._id) === userIdStr && (
                    <>
                      <div className="flex items-center gap-1 text-white">
                        <FiEye className="text-sm" />
                        <span className="text-xs">{selectedStory.viewers?.length || 0}</span>
                      </div>
                   <button
  onClick={async () => {
    await deleteStory(selectedStory._id);
    setSelectedStory(null); // 👈 close modal right after delete
  }}
  className="p-2 text-white hover:text-red-500 cursor-pointer"
>
  <FiTrash2 size={20} />
</button>

                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;
