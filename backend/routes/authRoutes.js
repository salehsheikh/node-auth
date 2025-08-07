import express from 'express';
import {  authCheck, loginUser,  registerUser, requestPasswordResetOTP, resendRegistrationOtp, resetPassword, verifyOTP, verifyRegistration } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { facebookCallback, facebookLogin, googleCallback, googleLogin, socialAuthSuccess } from '../controllers/socialAuthController.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-registration',verifyRegistration);
router.post('/resend-verification',resendRegistrationOtp)
router.get('/me',protect, authCheck)
router.post('/login',loginUser);
router.post('/request-otp',requestPasswordResetOTP);
router.post('/verify-otp',verifyOTP);
router.post('/reset-password',resetPassword);


router.get('/google', googleLogin);
router.get('/google/callback', googleCallback, socialAuthSuccess);

router.get('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback, socialAuthSuccess);
export default router;