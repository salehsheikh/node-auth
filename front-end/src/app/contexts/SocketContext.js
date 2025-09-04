"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      
      newSocket.emit("join-user-room", user._id);
      newSocket.on("new-post", (data) => {
        // Skip if the post is by the current user
        if (data.post.user._id === user._id) return;

        console.log("New post notification:", data);
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: data.message,
            post: data.post,
            timestamp: new Date(),
            type: "post",
          },
          ...prev,
        ]);
      });

      newSocket.on("new-story", (data) => {
        if (data.story.user._id === user._id) return;
        console.log("New story notification:", data);
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: data.message,
            story: data.story,
            timestamp: new Date(),
            type: "story",
          },
          ...prev,
        ]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = { socket, notifications, setNotifications, clearNotifications };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};