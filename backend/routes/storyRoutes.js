import express from "express";
import { addToHighlights, createStory, deleteStory, getHighlights, getStories, removeFromHighlights, toggleLikeStory, viewStory } from "../controllers/stotyController.js";
import { storage } from '../utils/cloudinary.js';
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
const router=express.Router();
const upload = multer({ storage });
router.route("/").get(protect,getStories)
.post(protect,upload.single("image"),createStory);

router.put("/:id/like",protect,toggleLikeStory);
router.put("/:id/view",protect,viewStory);
router.delete("/:id",protect,deleteStory);
router.get("/highlights", protect, getHighlights);
router.post("/:storyId/highlight", protect, addToHighlights);
// In your routes file
router.delete('/:storyId/highlight', protect, removeFromHighlights);

export default router;