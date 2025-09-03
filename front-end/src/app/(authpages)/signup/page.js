"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaEye, FaEyeSlash, FaEnvelope, FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = registration, 2 = verification
  const [showPassword, setShowPassword] = useState(false);
  const { register, verifyRegistration, resendVerificationOtp, tempUser } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        if (result.needsVerification) {
          setStep(2); // Move to verification step
        } else {
          setTimeout(() => router.push('/login'), 1000);
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await verifyRegistration(otp);
      
      if (result.success) {
        setError('');
        setTimeout(() => router.push('/login'), 1000); 
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await resendVerificationOtp();
      
      if (result.success) {
        setError('New OTP sent successfully');
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resending OTP');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-white">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-blue-100 mt-2">
            {step === 1 ? 'Join our community today' : 'Check your email for the verification code'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              error.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          {step === 1 ? (
            // Registration Form
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="userName">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                    required
                    minLength="3"
                    maxLength="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Create a password"
                    required
                    minLength="5"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          ) : (
            // Verification Form
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-blue-600 text-2xl" />
                </div>
                <p className="text-gray-600">
                  We've sent a verification code to
                </p>
                <p className="font-semibold text-gray-800">{tempUser?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="otp">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-xl tracking-widest"
                  placeholder="000000"
                  required
                  maxLength="6"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center">
            {step === 1 ? (
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Enter the verification code sent to your email address.
                <br />
                Check your spam folder if you don't see it.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}