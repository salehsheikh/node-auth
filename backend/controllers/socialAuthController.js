import asyncHandler from 'express-async-handler';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();
import { generateAuthToken } from '../utils/tokenUtils.js';
const googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
});
const googleCallback = asyncHandler(async (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Authentication failed' });
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=social_auth_failed`);
        }
        const token = generateAuthToken(user._id, user.role);
        resizeBy.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.redirect(`${process.env.FRONTEND_URL}/user-setting`);
    })(req, res, next);
});

const facebookLogin = passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
});

const facebookCallback = asyncHandler(async (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=social_auth_failed`);
        }
        const token = generateAuthToken(user._id, user.role);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    })(req, res, next);
});

const socialAuthSuccess = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = generateAuthToken(req.user._id, req.user.role);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: req.user._id,
            userName: req.user.userName,
            email: req.user.email,
            role: req.user.role,
            profileImg: req.user.profileImg,
            isVerified: true
        }
    });
});
export {
    googleLogin,
    googleCallback,
    facebookLogin,
    facebookCallback,
    socialAuthSuccess
}

