import express from 'express';
import {  authCheck, loginUser, registerUser, requestPasswordResetOTP, resetPassword, verifyOTP } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.get('/me',protect, authCheck)
router.post('/login',loginUser);
router.post('/request-otp',requestPasswordResetOTP);
router.post('/verify-otp',verifyOTP);
router.post('/reset-password',resetPassword);

export default router;