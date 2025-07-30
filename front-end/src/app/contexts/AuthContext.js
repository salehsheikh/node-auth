"use client"
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL
useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await axios.get(`${backend_url}/api/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        console.error('Token invalid or expired:', err);
        logout(); 
      }
    }
    setLoading(false);
  };

  initializeAuth();
}, []);

const register = async (userData) => {
  try {
    const res = await axios.post(`${backend_url}/api/auth/register`, userData);

    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);

      return {
        success: true,
        message: res.data.message || 'Registration successful',
        user: res.data.user
      };
    } else {
      throw new Error(res.data?.message || 'Registration failed');
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Registration failed';

    setError(errorMessage);

    return {
      success: false,
      message: errorMessage
    };
  }
};


  // Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/login`, credentials);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/login');
  };

  const requestResetOtp = async (email) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/request-otp`, { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };


    const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/reset-password`, { resetToken, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${backend_url}/api/profile`, profileData);
      setUser(prev => ({ ...prev, ...res.data.user }));
      return { 
        success: true, 
        user: res.data.user,
        message: 'Profile updated successfully' 
      };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Profile update failed' 
      };
    }
  };
 const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await axios.post(`${backend_url}/api/profile/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    setUser(prev => ({ ...prev, profileImg: res.data.imageUrl }));

    return { 
      success: true, 
      imageUrl: res.data.imageUrl,
      message: 'Profile image updated' 
    };
  } catch (err) {
    return { 
      success: false, 
      message: err.response?.data?.message || 'Image upload failed' 
    };
  }
};


  const verifyOtp = async (email, code) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/verify-otp`, { email, code });
      return { success: true, resetToken: res.data.resetToken };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'OTP verification failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        logout,
        requestResetOtp,
        verifyOtp,
        resetPassword,
        updateProfile,
        uploadProfileImage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);