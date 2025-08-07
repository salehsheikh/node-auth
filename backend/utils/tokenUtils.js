import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../modals/userModal.js';

export const generateAuthToken = (userId, role, tokenVersion) => {
  return jwt.sign(
    { id: userId, role, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateResetToken = (email) => {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Add this new middleware to check token version
export const verifyTokenVersion = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+tokenVersion');
  
  if (req.user.tokenVersion !== user.tokenVersion) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please log in again.'
    });
  }
  
  next();
});