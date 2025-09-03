"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  FiUser, 
  FiLogOut, 
  FiCreditCard,
  FiX,
  FiMenu,
 
} from 'react-icons/fi';
import { IoIosNotifications } from "react-icons/io";
import { useSocket } from '../contexts/SocketContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router =useRouter();
 
const { notifications, clearNotifications } = useSocket();
 

const [showNotifications, setShowNotifications] = useState(false);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest(".notification-container") && showNotifications) {
      setShowNotifications(false);
    }
    if (!event.target.closest(".profile-menu-container") && isProfileMenuOpen) {
      setIsProfileMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showNotifications, isProfileMenuOpen]);


  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-40">
      <div className=" px-0">
        <div className="flex justify-between items-center  h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl">
              Socialoo
            </Link>
          </div>

         

          <div className="flex items-center space-x-5">
            <Link 
              href="/subscribe" 
              className="hidden md:flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              <FiCreditCard className="mr-2" />
              Upgrade
            </Link>

            {/* Notification Bell */}
          <div className="relative notification-container z-50">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="bg-[#C5A713] p-3 rounded-full hover:bg-[#e0c234] transition cursor-pointer"
  >
    <IoIosNotifications className="text-white text-xl" />
    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-gray-400">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 border-b border-gray-700 hover:bg-gray-800 transition"
            >
              <p className="text-sm">{notification.message}</p>
              {notification.type === "story" && (
                <span className="inline-block px-2 py-1 text-xs bg-purple-600 rounded-full mt-1">
                  Story
                </span>
              )}
              {notification.type === "post" && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-600 rounded-full mt-1">
                  Post
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>


     
           

            {/* Profile Menu */}
            <div className="relative profile-menu-container">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center text-sm rounded-full cursor-pointer focus:outline-none"
              >
                {user?.profileImg ? (
                  <Image
                    src={user.profileImg}
                    alt="Profile"
                    width={42}
                    height={42}
                    className="h-10.5 w-10.5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.userName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  <Link 
                    href="/user-setting" 
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FiUser className="mr-3" />
                    Your Profile
                  </Link>
                  
                  <Link 
                    href="/subscribe" 
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 md:hidden"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FiCreditCard className="mr-3" />
                    Subscription
                  </Link>
                  
                  <button
      onClick={() => {
        logout();
        setIsProfileMenuOpen(false);
        router.push("/login"); 
      }}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
    >
      <FiLogOut className="mr-3" />
      Sign out
    </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/explore" 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              href="/messages" 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Messages
            </Link>
            <Link 
              href="/subscribe" 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Subscription
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}