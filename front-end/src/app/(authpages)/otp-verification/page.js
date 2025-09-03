"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaArrowLeft, FaEnvelope, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

export default function VerifyOtpPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const { verifyOtp, resendVerificationOtp } = useAuth();

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    if (digits.length === 6) {
      const newCode = [...Array(6)].map((_, i) => digits[i] || '');
      setCode(newCode);
      document.getElementById(`code-5`).focus();
    }
  };

  const handleSubmit = async (fullCode = code.join('')) => {
    if (fullCode.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');
    
    if (!email) {
      setMessage('Email is required');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOtp(email, fullCode);
      if (result.success && result.resetToken) {
        setMessage('Verification successful! Redirecting...');
        setTimeout(() => {
          router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
        }, 1000);
      } else {
        setMessage(result.message || 'OTP verification failed');
      }
    } catch (error) {
      setMessage('An error occurred during verification');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return;

    setLoading(true);
    setMessage('');
    
    try {
      const result = await resendVerificationOtp(email);
      if (result.success) {
        setMessage('New verification code sent!');
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        setMessage(result.message || 'Failed to resend code');
      }
    } catch (error) {
      setMessage('An error occurred while resending code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/forget-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
          <button
            onClick={handleBack}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Code</h1>
          <p className="text-blue-100 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.includes('success') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('success') ? (
                  <FaCheckCircle className="flex-shrink-0" />
                ) : (
                  <span className="text-red-500">⚠</span>
                )}
                {message}
              </div>
            </div>
          )}

          {/* Email Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaEnvelope className="text-gray-400" />
              <span className="font-medium">Code sent to:</span>
              <span className="text-gray-800">{email}</span>
            </div>
          </div>

          {/* OTP Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-3 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                loading || code.join('').length !== 6
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className={`font-medium transition-colors ${
                  resendCooldown > 0 || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
              <FaShieldAlt className="text-blue-500" />
              Security Tips
            </h4>
            <p className="text-xs text-blue-600">
              • The code will expire in 10 minutes
              <br />
              • Check your spam folder if you don't see the email
              <br />
              • Never share your verification code with anyone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}