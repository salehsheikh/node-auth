import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage,
  deleteProfileImage,
  getUserProfile
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { storage } from '../utils/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage });

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);
router.get("/:id",protect , getUserProfile)
router.route('/upload-image')
  .post(protect, upload.single('profileImg'), uploadProfileImage);

router.route('/delete-image')
  .delete(protect, deleteProfileImage);

export default router;