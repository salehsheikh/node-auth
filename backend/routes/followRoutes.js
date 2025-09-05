import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkFollowStatus, followUser, getFollowers, getFollowing, getSuggestions, unfollowUser } from '../controllers/followController.js';

const router = express.Router();
router.post('/:userId', protect , followUser);
router.delete('/:userId',protect,unfollowUser);
router.get ('/followers/:userId',getFollowers);
router.get ('/following/:userId',getFollowing);
router.get ('/check/:userId' , protect, checkFollowStatus);
router.get("/suggestions", protect, getSuggestions);
export default router;