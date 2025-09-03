"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing reset token - please restart the password reset process');
      console.error('Token is undefined in URL');
    }
  }, [token]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!token) {
      setMessage('Reset token is missing - please try the password reset process again');
      setLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage('All fields are required');
      setLoading(false);
      return;
    }

    if (newPassword.length < 5) {
      setMessage('Password must be at least 5 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, newPassword);
      setMessage(result.message);
      
      if (result.success) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage('An error occurred during password reset');
      console.error('Reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/login');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Medium';
    if (passwordStrength === 3) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
          <button
            onClick={handleBack}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
            aria-label="Go back to login"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-blue-100 mt-2">
            Create a new password for your account
          </p>
        </div>

        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.includes('success') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message.includes('success') ? (
                <FaCheckCircle className="flex-shrink-0" />
              ) : (
                <FaExclamationTriangle className="flex-shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {!token && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-xl">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle />
                <span>Invalid reset link. Please request a new password reset.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" size={16} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={5}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!token}
                >
                  {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength === 0 ? 'text-gray-500' :
                      passwordStrength === 1 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-orange-500' :
                      passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                  required
                  minLength={5}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={!token}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                loading || !token
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  newPassword.length >= 5 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Minimum 5 characters
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                8+ characters for better security
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Uppercase letters
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Numbers
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  /[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Special characters
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}