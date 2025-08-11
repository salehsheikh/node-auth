import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  toggleLike,
  updateComment,
  deleteComment,
  addComment,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage });

router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.put('/:postId/comments/:commentId', protect, updateComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

export default router;
