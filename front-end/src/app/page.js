"use client";
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {user ? `Welcome ${user.userName}!` : 'Welcome to Our App!'}
        </h1>
        
        <p className="mb-6">
          {user ? 'You are now logged in to your account.' : 'Please log in to access your account.'}
        </p>
        
        <div className="max-w-xs">
          {user ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full py-2 px-4 rounded-lg transition duration-200 ${
                isLoggingOut 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;