"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useStories } from "../contexts/StoryContext";
import { useAuth } from "../contexts/AuthContext"; 

const Story = () => {
  const { stories, createStory, toggleLikeStory, deleteStory,viewStory } = useStories();
  const { user , loading: authLoading} = useAuth(); 

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
 const viewedStoriesRef = useRef(new Set());
  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Submit new story
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    await createStory(formData);

    setCaption("");
    setFile(null);
    setPreview(null);
  };
  useEffect(() => {
    
    if (stories.length && user && ! authLoading) {
      stories.forEach((story) => {
        if (!story.viewers.includes(user._id) && !viewedStoriesRef.current.has(story._id)) {
          viewStory(story._id); // mark as viewed
          viewedStoriesRef.current.add(story._id); // ✅ prevent infinite loop
        }
      });
    }
  }, [stories, user, viewStory,authLoading]);

  if (authLoading) {
    return <div>Loading...</div>; // Or a skeleton loader
  }
  return (
    <div className="w-full p-6">
      {/* Create Story */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 border rounded-xl bg-black"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 rounded "
        />

        {preview && (
          <div className="relative w-full h-40">
            <Image
              src={preview}
              alt="preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Post Story
        </button>
      </form>

      {/* Stories List */}
      <div className="mt-6 flex flex-col gap-6">
        {stories.length === 0 ? (
          <p className="text-gray-500 text-center">No stories yet.</p>
        ) : (
          stories.map((story) => (
            <div
              key={story._id}
              className="border rounded-xl p-4 shadow-md bg-white"
           
            >
              {/* User Info */}
           <div className="flex items-center gap-3 mb-3">
            {story.user && story.user.profileImg &&
            (
                 <Image
    src={story.user?.profileImg}
    alt="profile"
    width={40}
    height={40}
    className="rounded-full"
  />
            )}
 
  <p className="font-semibold">{story.user?.userName}</p>
</div>

              {/* Story Image */}
              <div className="relative w-full h-60">
                <Image
                  src={story.image}
                  alt="story"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              {/* Caption */}
              {story.caption && (
                <p className="mt-3 text-gray-700">{story.caption}</p>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center mt-3">
                
                <button
                  onClick={() => toggleLikeStory(story._id)}
                  className="text-blue-500 hover:underline"
                >
                  ❤️ {story.likes?.length || 0}
                </button>
 {user && story.user && String(story.user._id) === String(user._id) && (
  <>
    <span className="text-green-500">
      👁️ {story.viewers?.length || 0}
    </span>
    <button
      onClick={() => deleteStory(story._id)}
      className="text-red-500 hover:underline"
    >
      🗑️ Delete
    </button>
  </>
)}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Story;
