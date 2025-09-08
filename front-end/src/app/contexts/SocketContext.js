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
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch initial notifications
      fetchNotifications();

      const newSocket = io("http://localhost:5000", {
        transports: ['websocket', 'polling'] // Ensure multiple transport methods
      });
      
      setSocket(newSocket);

      // Join user's personal room for targeted notifications
      newSocket.emit("join-user-room", user._id);
      newSocket.emit("join-notifications", user._id);
      
      console.log("Socket connected, joined rooms for user:", user._id);

      // LISTEN FOR FOLLOW-UPDATE EVENT (CRITICAL FIX)
      newSocket.on("follow-update", async (data) => {
        console.log("Received follow-update event:", data);
        
        // Check if this update is relevant to the current user
        if (data.followingId === user._id) {
          console.log("User was followed, refreshing notifications...");
          await fetchNotifications();
        }
      });

      // New post notification
      newSocket.on("new-post", async (data) => {
        if (data.post.user._id === user._id) return;
        console.log("Received new-post notification");
        await fetchNotifications();
      });

      // New story notification
      newSocket.on("new-story", async (data) => {
        if (data.story.user._id === user._id) return;
        console.log("Received new-story notification");
        await fetchNotifications();
      });

      // Follow notification
      newSocket.on("new-follow", async (data) => {
        console.log("Received new-follow notification:", data);
        await fetchNotifications();
      });

     newSocket.on("new-notification", async (notification) => {
  console.log("Received new-notification:", notification);

  // Update state instantly
  setNotifications((prev) => [notification, ...prev]);
  setUnreadCount((prev) => prev + 1);
  
});



      // Debug: Log all received events
      newSocket.onAny((eventName, ...args) => {
        console.log("Socket event received:", eventName, args);
      });

      // Handle connection events
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        // Clean up all event listeners
        newSocket.off("follow-update");
        newSocket.off("new-post");
        newSocket.off("new-story");
        newSocket.off("new-follow");
        newSocket.off("new-notification");
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.offAny();
        newSocket.disconnect();
      };
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const clearNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/clear', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const value = { 
    socket, 
    notifications, 
    unreadCount,
    setNotifications, 
    clearNotifications,
    markNotificationAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};