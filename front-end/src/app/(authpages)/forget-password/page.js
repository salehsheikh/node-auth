"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaEnvelope, FaArrowLeft, FaKey } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { requestResetOtp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await requestResetOtp(email);
    if (result.success) {
      router.push(`/otp-verification?email=${encodeURIComponent(email)}`);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
          <button
            onClick={handleBackToLogin}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
            aria-label="Go back to login"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaKey className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-blue-100 mt-2">
            Enter your email to receive a verification code
          </p>
        </div>

        <div className="p-8">
          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {message}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send a 6-digit code to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Code...
                </div>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <button
                onClick={handleBackToLogin}
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaKey className="text-gray-400" />
              Security Note
            </h4>
            <p className="text-xs text-gray-500">
              For your security, the verification code will expire after 10 minutes. 
              Make sure to check your spam folder if you don't see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}