import asyncHandler from 'express-async-handler';
import Notification from '../modals/NotificationModel.js';

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'userName profileImg isVerified')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    read: false 
  });

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// POST /api/notifications/:id/read - Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { 
      _id: req.params.id, 
      recipient: req.user._id 
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({ success: true, notification });
});

// POST /api/notifications/read-all - Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { 
      recipient: req.user._id,
      read: false 
    },
    { read: true }
  );

  res.json({ success: true });
});

// DELETE /api/notifications/clear - Clear all notifications
const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.json({ success: true });
});

export { getNotifications, markAsRead, markAllAsRead, clearNotifications };