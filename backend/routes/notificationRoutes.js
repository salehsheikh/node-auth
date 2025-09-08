
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { clearNotifications, getNotifications, markAllAsRead, markAsRead } from '../controllers/notifyController.js';



const router = express.Router();

router.use(protect);

router.get('/', getNotifications);

router.post('/:id/read', markAsRead);

router.post('/read-all', markAllAsRead);



router.delete('/clear', clearNotifications);

export default router;