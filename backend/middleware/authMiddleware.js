import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../modals/userModal.js';


const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } 
  // Check Authorization header
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check query parameters (for social auth redirects)
  else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    console.warn('No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn('User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    req.user = user;
    
    // Set cookie for future requests (so they don't need query param)
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    next();

  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
});

// Moderator middleware 
const moderator = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as moderator'
    });
  }
});

export { protect, admin, moderator };