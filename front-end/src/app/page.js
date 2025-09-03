"use client";
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiHome, FiUser, FiSettings, FiLogOut, FiArrowRight, FiMessageCircle, FiImage, FiUsers, FiStar } from 'react-icons/fi';

const Home = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const features = [
    {
      icon: <FiMessageCircle className="text-blue-500 text-xl" />,
      title: "Connect with Friends",
      description: "Share moments and stay connected with people who matter most."
    },
    {
      icon: <FiImage className="text-purple-500 text-xl" />,
      title: "Share Your Story",
      description: "Post photos and updates to keep your network in the loop."
    },
    {
      icon: <FiUsers className="text-green-500 text-xl" />,
      title: "Build Community",
      description: "Join groups and meet people who share your interests."
    },
    {
      icon: <FiStar className="text-amber-500 text-xl" />,
      title: "Premium Features",
      description: "Unlock exclusive benefits with our subscription plans."
    }
  ];

  const quickActions = [
    {
      title: "View Profile",
      icon: <FiUser className="text-gray-600" />,
      action: () => router.push('/user-setting')
    },
    {
      title: "Settings",
      icon: <FiSettings className="text-gray-600" />,
      action: () => router.push('/')
    },
    {
      title: "Explore",
      icon: <FiHome className="text-gray-600" />,
      action: () => router.push('/')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FiHome className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Socialoo</h1>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden md:inline">Hello, {user.userName}</span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiLogOut />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {user ? (
          // Logged-in User View
          <div className="grid md:grid-cols-3 gap-8">
            {/* Welcome Card */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user.userName}! 👋</h2>
              <p className="text-gray-600 mb-6">Here's what's happening with your network today.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">New notifications</p>
                  <p className="text-2xl font-bold text-gray-800">3</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Friend requests</p>
                  <p className="text-2xl font-bold text-gray-800">2</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-800">5</p>
                </div>
              </div>

              <button 
                onClick={() => router.push('/posts')}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <span>View your feed</span>
                <FiArrowRight />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {action.icon}
                    <span className="text-gray-700">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="md:col-span-3 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Why you'll love Socialoo</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Logged-out User View
          <div className="flex flex-col items-center text-center py-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Connect with friends and the world around you
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl">
                Socialoo is a modern social platform that helps you stay connected with people and share what matters to you.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSignup}
                  className="px-6 py-3 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
                >
                  Create an Account
                </button>
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 cursor-pointer border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Socialoo. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;