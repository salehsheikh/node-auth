import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../modals/userModal.js';


const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Found jwt cookie:', token);
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Found Authorization header:', token);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.warn('User not found for ID:', decoded.id);
      } else {
        req.user = user;
        console.log('req.user set:', user._id.toString());
        const now = Date.now() / 1000;
        if (decoded.exp - now < 86400) {
          const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
          res.cookie('jwt', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          console.log('Refreshed jwt cookie:', newToken);
        }
      }
    } catch (err) {
      console.error('Token verification error:', err.message);
    }
  } else {
    console.warn('No token provided');
  }

  next();
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