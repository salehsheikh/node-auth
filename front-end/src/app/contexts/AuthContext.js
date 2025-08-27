'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = searchParams.get('token');
      const userData = searchParams.get('user');
      const authError = searchParams.get('error');

      if (authError) {
        setError(decodeURIComponent(authError));
        setLoading(false);
        router.push(`/login?error=${authError}`);
        return;
      }

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userData));
          setUser(parsedUser);
          setLoading(false);
          router.push('/user-setting');
          return;
        } catch (err) {
          console.error('Error parsing OAuth user data:', err);
          setError('Invalid OAuth data');
          setLoading(false);
          router.push('/login?error=invalid_oauth_data');
          return;
        }
      }

      try {
  const res = await axios.get(`${backend_url}/api/auth/me`, { withCredentials: true });
  const userData = res.data.user;
  setUser({
    ...userData,
    _id: userData._id || userData.id,  // normalize
  });
} catch (err) {
  console.error('Token invalid or expired:', err);
  logout();
}

      setLoading(false);
    };

    initializeAuth();
  }, [searchParams, router]);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/login`, credentials, { withCredentials: true });
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };


  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(`${backend_url}/api/auth/register`, userData);
      if (res.data?.success) {
        setTempUser({
          email: userData.email,
          tempUserId: res.data.tempUserId,
        });
        return {
          success: true,
          message: res.data.message || 'OTP sent to your email for verification',
          needsVerification: true,
        };
      } else {
        throw new Error(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const resendVerificationOtp = async () => {
    try {
      if (!tempUser) {
        throw new Error('No pending registration');
      }
      const res = await axios.post(`${backend_url}/api/auth/resend-verification`, {
        email: tempUser.email,
        tempUserId: tempUser.tempUserId,
      });
      return {
        success: true,
        message: res.data?.message || 'New OTP sent successfully',
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to resend OTP';
      setError(errorMessage);
      return { success: false, message: errorMessage };
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
        tempUserId: tempUser.tempUserId,
      });
      if (res.data?.success) {
        setUser(res.data.user);
        setTempUser(null);
        return {
          success: true,
          message: res.data.message || 'Registration complete!',
          user: res.data.user,
        };
      } else {
        throw new Error(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Verification failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

 
  const socialLogin = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
  try {
    // Call backend logout endpoint to clear the JWT cookie
    await axios.post(`${backend_url}/api/auth/logout`, {}, { 
      withCredentials: true 
    });
  } catch (err) {
    console.error('Logout error:', err);
    // Even if backend logout fails, clear frontend state
  } finally {
    // Always clear frontend state
    setUser(null);
    
    // Clear any client-side storage
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Clear cookies on client side too
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
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
      const res = await axios.post(`${backend_url}/api/auth/reset-password`, {
        resetToken,
        newPassword,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${backend_url}/api/profile`, profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser((prev) => ({ ...prev, ...res.data.user }));
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return {
        success: true,
        user: res.data.user,
        message: 'Profile updated successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImg', imageFile);
      const res = await axios.post(`${backend_url}/api/profile/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUser((prev) => ({ ...prev, profileImg: res.data.user.profileImg }));
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return {
        success: true,
        imageUrl: res.data.user.profileImg,
        message: 'Profile image updated',
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Image upload failed',
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
        socialLogin,
        logout,
        requestResetOtp,
        verifyOtp,
        resetPassword,
        updateProfile,
        uploadProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);