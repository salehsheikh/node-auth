"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext";
import { FiHeart, FiEye, FiTrash2, FiX, FiPlus, FiStar } from "react-icons/fi";

const Story = () => {
  const { stories, createStory, toggleLikeStory, deleteStory, viewStory, highlights, addToHighlights, removeFromHighlights } = useStories();
  const { user, loading: authLoading } = useAuth();

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const viewedStoriesRef = useRef(new Set());

  // --- helpers
  const userIdStr = String(user?._id || "");
  
  const isInHighlights = (storyId) => {
    return highlights.some(h => h.story === storyId || h._id === storyId);
  };

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

  const handleToggleHighlight = async () => {
    if (!selectedStory || highlightLoading) return;
    
    setHighlightLoading(true);
    try {
      if (isInHighlights(selectedStory._id)) {
        await removeFromHighlights(selectedStory._id);
      } else {
        await addToHighlights(selectedStory._id);
      }
    } finally {
      setHighlightLoading(false);
    }
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

  // keep modal story in sync with context updates
  useEffect(() => {
    if (!selectedStory) return;
    const latest = stories.find((s) => s._id === selectedStory._id);
    if (latest) setSelectedStory((prev) => ({ ...prev, ...latest }));
  }, [stories, selectedStory?._id]);

  // optimistic like in modal
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
      {/* Highlights Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Highlights</h2>
        <div className="flex gap-4 overflow-x-auto">
          {highlights.map((h) => (
            <div
              key={h._id}
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-yellow-400 shrink-0"
              onClick={() => {
                // Create a story-like object for the viewer
                setSelectedStory({
                  _id: h.story || h._id,
                  image: h.image,
                  caption: h.title,
                  user: {
                    _id: h.user,
                    userName: h.userInfo?.userName || "User",
                    profileImg: h.userInfo?.profileImg || "/default-avatar.png"
                  },
                  isHighlight: true // Flag to identify this is from highlights
                });
              }}
              title={h.title}
            >
              {h.image ? (
                <Image 
                  src={h.image} 
                  alt="highlight" 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <FiX className="text-white text-2xl" />
                </div>
              )}
              
              
             
            </div>
          ))}
          {highlights.length === 0 && (
            <p className="text-gray-500 text-sm flex items-center">
              No highlights yet
            </p>
          )}
        </div>
      </div>

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
            <Image 
              src={selectedStory.image} 
              alt="story" 
              fill 
              className="object-contain" 
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              {selectedStory.caption && selectedStory.caption !== "Highlights" && (
                <p className="text-white text-lg mb-3">{selectedStory.caption}</p>
              )}

              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={selectedStory.user?.profileImg || "/default-avatar.png"}
                      alt="profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="text-white font-medium">
                    {selectedStory.user?.userName || "User"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Like button - only for actual stories, not highlights */}
                  {!selectedStory.isHighlight && (
                    <button
                      onClick={handleToggleLikeInModal}
                      disabled={likeLoading}
                      className={`p-2 rounded-full cursor-pointer ${
                        hasUserLiked(selectedStory) ? "text-pink-500" : "text-white"
                      } ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <FiHeart size={20} />
                    </button>
                  )}

                  {/* View count - only for actual stories */}
                  {!selectedStory.isHighlight && user && selectedStory.user && String(selectedStory.user._id) === userIdStr && (
                    <div className="flex items-center gap-1 text-white">
                      <FiEye className="text-sm" />
                      <span className="text-xs">{selectedStory.viewers?.length || 0}</span>
                    </div>
                  )}

                  {/* Delete button - only for user's own stories */}
                  {!selectedStory.isHighlight && user && selectedStory.user && String(selectedStory.user._id) === userIdStr && (
                    <button
                      onClick={async () => {
                        await deleteStory(selectedStory._id);
                        setSelectedStory(null);
                      }}
                      className="p-2 text-white hover:text-red-500 cursor-pointer"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  )}

                  {/* Highlight toggle - only for user's own stories */}
                  {!selectedStory.isHighlight && user && selectedStory.user && String(selectedStory.user._id) === userIdStr && (
                    <button
                      onClick={handleToggleHighlight}
                      disabled={highlightLoading}
                      className={`p-2 rounded-full cursor-pointer ${
                        isInHighlights(selectedStory._id) ? "text-yellow-500" : "text-white"
                      } ${highlightLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      title={isInHighlights(selectedStory._id) ? "Remove from highlights" : "Add to highlights"}
                    >
                      <FiStar
                        size={20}
                        fill={isInHighlights(selectedStory._id) ? "currentColor" : "none"}
                      />
                    </button>
                  )}

                  {/* Remove from highlights button - for highlights */}
                  {selectedStory.isHighlight && user && (
                    <button
                      onClick={async () => {
                        const highlight = highlights.find(h => 
                          h.story === selectedStory._id || h._id === selectedStory._id
                        );
                        if (highlight) {
                          await removeFromHighlights(highlight.story || highlight._id);
                        }
                        setSelectedStory(null);
                      }}
                      className="p-2 text-white hover:text-red-500 cursor-pointer"
                      title="Remove from highlights"
                    >
                      <FiTrash2 size={20} />
                    </button>
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