import asyncHandler from 'express-async-handler';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();
import { generateAuthToken } from '../utils/tokenUtils.js';

const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

const googleCallback = asyncHandler(async (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('Google Auth Error:', { error: err, info: info?.message });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(info?.message || err?.message || 'social_auth_failed')}`
      );
    }
    req.user = user;
    socialAuthSuccess(req, res, next);
  })(req, res, next);
});

const facebookLogin = passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
  session: false,
});

const facebookCallback = asyncHandler(async (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('Facebook Auth Error:', { error: err, info: info?.message });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(info?.message || err?.message || 'social_auth_failed')}`
      );
    }
    req.user = user;
    socialAuthSuccess(req, res, next);
  })(req, res, next);
});

const socialAuthSuccess = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const token = generateAuthToken(req.user._id, req.user.role);
  res.redirect(
    `${process.env.FRONTEND_URL}/user-setting?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: req.user._id,
        userName: req.user.userName,
        email: req.user.email,
        role: req.user.role,
        profileImg: req.user.profileImg,
        isVerified: true,
      })
    )}`
  );
});

export { googleLogin, googleCallback, facebookLogin, facebookCallback, socialAuthSuccess };