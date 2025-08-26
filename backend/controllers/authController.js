import User from '../modals/userModal.js';
import Otp from '../modals/Otp.js'
import { generateOTP } from '../utils/helper.js';
import { sendOtpEmail } from '../utils/email.js';
import asyncHandler from 'express-async-handler';
import { generateAuthToken, generateResetToken, verifyToken } from '../utils/tokenUtils.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Please provide all required fields' 
    });
  }

  if (password.length < 5) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 5 characters' 
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ 
      success: false,
      message: 'User already exists with this email' 
    });
  }

  const otp = generateOTP();
  
  await Otp.deleteMany({ email }); // Clear any existing OTPs for this email
  const otpDoc = new Otp({
    email,
    code: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
    purpose: 'registration', // Differentiate from password reset OTPs
    attempts: 0 
  });
  await otpDoc.save();

  // Create temporary user record (not active yet)
  const tempUser = await User.create({
    userName,
    email,
    password,
    isVerified: false
  });

  // Send OTP email
  await sendOtpEmail(email, otp);

  return res.status(201).json({
    success: true,
    message: 'OTP sent to email for verification',
    tempUserId: tempUser._id 
  });
});

export const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, tempUserId } = req.body;

  if (!email || !tempUserId) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and temporary user ID are required' 
    });
  }

  // Check if user exists and is unverified
  const user = await User.findOne({ 
    _id: tempUserId, 
    email,
    isVerified: false 
  });

  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: 'User not found or already verified' 
    });
  }

  // Check if last OTP request was too recent (rate limiting)
  const lastOtp = await Otp.findOne({ email, purpose: 'registration' })
    .sort({ createdAt: -1 });

  if (lastOtp && (Date.now() - lastOtp.createdAt < 30000)) { // 30 second cooldown
    return res.status(429).json({ 
      success: false,
      message: 'Please wait 30 seconds before requesting a new OTP' 
    });
  }

  const newOtp = generateOTP();
  
  // Update or create new OTP record
  await Otp.deleteMany({ email, purpose: 'registration' });
  const otpDoc = new Otp({
    email,
    code: newOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
    purpose: 'registration',
    attempts: 0 
  });
  await otpDoc.save();

  await sendOtpEmail(email, newOtp);

  return res.status(200).json({
    success: true,
    message: 'New OTP sent to email',
    tempUserId // Return same tempUserId for consistency
  });
});

export const verifyRegistration = asyncHandler(async (req, res) => {
  const { email, code, tempUserId } = req.body;
  
  if (!email || !code || !tempUserId) {
    return res.status(400).json({ 
      success: false,
      message: 'Email, OTP, and temporary user ID are required' 
    });
  }

  // Verify OTP
  const otpDoc = await Otp.findOne({ email, purpose: 'registration' });
  
  if (!otpDoc) {
    return res.status(400).json({ 
      success: false,
      message: 'OTP not found or expired. Please request a new one.' 
    });
  }

  // Check attempts (prevent brute force)
  if (otpDoc.attempts >= 3) {
    await Otp.deleteOne({ email });
    return res.status(403).json({
      success: false,
      message: 'Too many attempts. Please request a new OTP.'
    });
  }

  if (otpDoc.code !== code) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    
    const remainingAttempts = 3 - otpDoc.attempts;
    return res.status(400).json({ 
      success: false,
      message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
    });
  }

  if (new Date() > otpDoc.expiresAt) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ 
      success: false,
      message: 'OTP has expired. Please request a new one.' 
    });
  }

  // OTP is valid - activate user
  const user = await User.findByIdAndUpdate(
    tempUserId,
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: 'Temporary user not found' 
    });
  }

  // Clean up OTP
  await Otp.deleteOne({ email });

  // Generate auth token
  const token = generateAuthToken(user._id, user.role);

  return res.status(200).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
      isVerified: user.isVerified
    }
  });
});

export const authCheck = (asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
      location: user.location,
      bio: user.bio,
      isSubscribed: user.isSubscribed || false, 
        subscriptionPlan: user.subscriptionPlan || null, 
        subscriptionEnd: user.subscriptionEnd || null 
    }
  });
}));

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide both email and password' 
    });
  }

  const user = await User.findOne({ email }).select('+isVerified');

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account not verified. Please check your email for the verification OTP.',
      needsVerification: true,
      tempUserId: user._id
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  const token = generateAuthToken(user._id, user.role); 

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
      location: user.location,
      bio: user.bio,
      isVerified: user.isVerified
    }
  });
});
export const requestPasswordResetOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: 'Email is required.' 
    });
  }

  try {
    // Check if user exists (prevent email enumeration attacks)
    const user = await User.findOne({ email }).select('+isVerified');
    if (!user) {
      return res.status(200).json({ 
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.' 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your account first.'
      });
    }

    const lastRequest = await Otp.findOne({ email })
      .sort({ createdAt: -1 });
    
    if (lastRequest && (Date.now() - lastRequest.createdAt < 60000)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting another OTP.'
      });
    }

    const otp = generateOTP();
    await Otp.deleteMany({ email });
    
    const otpDoc = new Otp({
      email,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
      purpose: 'password-reset',
      ipAddress: req.ip // Track request origin
    });

    await otpDoc.save();
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.' 
    });
  } catch (err) {
    console.error('OTP Request Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error sending OTP.' 
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and OTP are required.' 
    });
  }

  try {
    const otpDoc = await Otp.findOne({ 
      email,
      purpose: 'password-reset' 
    });

    if (!otpDoc) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP not found or expired. Please request a new one.' 
      });
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ email });
      return res.status(403).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      
      const remainingAttempts = 3 - otpDoc.attempts;
      return res.status(400).json({ 
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      });
    }

    if (new Date() > otpDoc.expiresAt) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ 
        success: false,
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    const user = await User.findOne({ email }).select('+isVerified');
    if (!user) {
      await Otp.deleteOne({ email });
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      });
    }

    if (!user.isVerified) {
      await Otp.deleteOne({ email });
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your account first.'
      });
    }

    const resetToken = generateResetToken(email);
    await Otp.deleteOne({ email });

    res.status(200).json({ 
      success: true,
      message: 'OTP verified successfully.', 
      resetToken,
      expiresIn: '10m' // Inform client when token expires
    });
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during OTP verification.' 
    });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: 'Reset token and new password are required.' });
  }

  try {
    const decoded = verifyToken(resetToken);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword; 
    await user.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
};

