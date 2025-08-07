"use client"
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempUser, setTempUser] = useState(null); 
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
      setError(null);
      const res = await axios.post(`${backend_url}/api/auth/register`, userData);

      if (res.data?.success) {
        setTempUser({
          email: userData.email,
          tempUserId: res.data.tempUserId
        });
        
        return {
          success: true,
          message: res.data.message || 'OTP sent to your email for verification',
          needsVerification: true
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
  const resendVerificationOtp = async () => {
    try {
      if (!tempUser) {
        throw new Error('No pending registration');
      }

      const res = await axios.post(`${backend_url}/api/auth/resend-verification`, {
        email: tempUser.email,
        tempUserId: tempUser.tempUserId
      });

      return {
        success: true,
        message: res.data?.message || 'New OTP sent successfully'
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to resend OTP';

      setError(errorMessage);

      return {
        success: false,
        message: errorMessage
      };
    }
  };
const verifyRegistration = async (otpCode) => {
  try {
    if (!tempUser) {
      throw new Error('No pending registration to verify');
    }

    const res = await axios.post(`${backend_url}/api/auth/verify-registration`, {
      email: tempUser.email,
      code: otpCode,
      tempUserId: tempUser.tempUserId
    });

    if (res.data?.success) {
      // Registration complete - set user data only
      setUser(res.data.user);
      setTempUser(null); // Clear temp user

      return {
        success: true,
        message: res.data.message || 'Registration complete!',
        user: res.data.user
      };
    } else {
      throw new Error(res.data?.message || 'Verification failed');
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Verification failed';

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
        resendVerificationOtp,
        verifyRegistration,
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