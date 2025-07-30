import bcrypt from 'bcrypt';
import User from '../modals/userModal.js';
import jwt from "jsonwebtoken";
import Otp from '../modals/Otp.js'
import { generateOTP } from '../utils/helper.js';
import { sendOtpEmail } from '../utils/email.js';
import asyncHandler from 'express-async-handler';
import { generateAuthToken } from '../utils/tokenUtils.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // Validate input
  if (!userName?.trim() || !email?.trim() || !password) {
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

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ 
      success: false,
      message: 'User already exists with this email' 
    });
  }

  // Create new user
  const user = await User.create({ userName, email, password });

  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid user data' 
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg
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
      bio: user.bio
    }
  });
}));


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateAuthToken(user._id, user.role); 

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
      location: user.location,
      bio: user.bio
    }
  });
});

export const requestPasswordResetOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const otp = generateOTP();

    
    await Otp.deleteMany({ email });


    const otpDoc = new Otp({
      email,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
    });

    await otpDoc.save();
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('OTP Request Error:', err);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) return res.status(400).json({ message: 'OTP not found.' });

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > otpDoc.expiresAt) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    await Otp.deleteOne({ email }); 
    console.log(resetToken);
    
    res.status(200).json({ message: 'OTP verified successfully.', resetToken });
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: 'Reset token and new password are required.' });
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateRes = await User.updateOne({ email }, { password: hashedPassword });

    if (updateRes.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found or password unchanged.' });
    }

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
};
