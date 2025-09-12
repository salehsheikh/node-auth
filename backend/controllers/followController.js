import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../modals/userModal.js';
import Follow from '../modals/followModel.js';
import Notification from '../modals/NotificationModel.js';

const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  // Validate userId parameter
  if (!userId || userId === 'undefined') {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  // Validate that userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
    });
  }

  if (userId === followerId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself',
    });
  }

  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const existingFollow = await Follow.isFollowing(followerId, userId);
  if (existingFollow) {
    return res.status(400).json({
      success: false,
      message: 'You are already following this user',
    });
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  let follow, populatedFollow, notification, populatedNotification, updatedFollower, updatedFollowing;
  try {
    // Create follow record
    [follow] = await Follow.create(
      [{ follower: followerId, following: userId }],
      { session }
    );

    // Update follower and following counts
    updatedFollower = await User.findByIdAndUpdate(
      followerId,
      { $inc: { followingCount: 1 } },
      { session, new: true }
    );

    updatedFollowing = await User.findByIdAndUpdate(
      userId,
      { $inc: { followersCount: 1 } },
      { session, new: true }
    );

    // Populate follow data
    populatedFollow = await Follow.findById(follow._id)
      .populate('follower', 'userName profileImg isVerified')
      .populate('following', 'userName profileImg')
      .session(session);

    // Check if user allows follow notifications
    const recipientUser = await User.findById(userId).session(session);
    if (recipientUser.settings?.notifications?.newFollowers !== false) {
      [notification] = await Notification.create(
        [
          {
            recipient: userId,
            sender: followerId,
            type: 'follow',
            message: `${populatedFollow.follower.userName} started following you`,
            relatedItem: follow._id,
            itemType: 'user',
          },
        ],
        { session }
      );

      populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'userName profileImg isVerified')
        .populate('recipient', 'userName profileImg')
        .session(session);
    }

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Follow error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your follow request',
    });
  }
  session.endSession();

  // Emit socket events after successful transaction
  const io = req.app.get('io');
  if (io) {
    // Emit to the specific user who was followed
    io.to(userId.toString()).emit('new-follow', {
      message: `${populatedFollow.follower.userName} started following you`,
      follow: populatedFollow,
      notification: populatedNotification,
    });
    console.log('Emitted new-follow to:', userId.toString());

    // Emit follow-update with correct counts
    io.emit('follow-update', {
      type: 'follow',
      followerId: followerId.toString(),
      followingId: userId.toString(),
      follower: populatedFollow.follower,
      following: populatedFollow.following,
      followerCount: updatedFollower?.followingCount || 0,
      followingCount: updatedFollowing?.followersCount || 0,
    });
    console.log('Emitted follow-update:', { followerId: followerId.toString(), followingId: userId.toString() });

    // Emit notification event if notification was created
    if (populatedNotification) {
      io.to(userId.toString()).emit('new-notification', {
        type: 'follow',
        notification: populatedNotification,
      });
      console.log('Emitted new-notification to:', userId.toString());
    }

    // Emit to the follower for real-time updates
    io.to(followerId.toString()).emit('follow-success', {
      message: `You are now following ${populatedFollow.following.userName}`,
      follow: populatedFollow,
    });
    console.log('Emitted follow-success to:', followerId.toString());
  }

  res.status(201).json({
    success: true,
    message: `You are now following ${userToFollow.userName}`,
    data: populatedFollow,
    notification: populatedNotification,
  });
});
const unfollowUser= asyncHandler(async (req,res)=>{
    const {userId} = req.params;
    const followerId= req.user._id;

    const follow= await Follow.findOneAndDelete({
        follower:followerId,
        following:userId
    });
    if (!follow){
        return res.status(404).json({
            success:false,
            message:'you are not following this user'
        });
    }
     // Update follower and following counts
  await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
  await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

    res.json({
    success: true,
    message: `You have unfollowed the user`
  });
});


const getFollowers = asyncHandler(async (req,res)=>{
    const {userId}= req.params;
    const page= parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page-1) *limit;

    const followers= await Follow.find({ following : userId}).
    populate('follower' , 'userName profileImg isVerified')
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalFollowers = await Follow.countDocuments({following:userId});
    res.json({
        success:true,
        data:followers,
        pagination:{
            page,
            limit,
            total:totalFollowers,
            pages:Math.ceil(totalFollowers/limit)
        }
    });
});

const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const following = await Follow.find({ follower: userId })
    .populate('following', 'userName profileImg isVerified')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalFollowing = await Follow.countDocuments({ follower: userId });

  res.json({
    success: true,
    data: following,
    pagination: {
      page,
      limit,
      total: totalFollowing,
      pages: Math.ceil(totalFollowing / limit)
    }
  });
});

// Get comprehensive follow status
const checkFollowStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  
  const [isFollowing, isFollowedBy] = await Promise.all([
    Follow.exists({
      follower: currentUserId,
      following: userId
    }),
    Follow.exists({
      follower: userId,
      following: currentUserId
    })
  ]);
  
  res.json({ 
    isFollowing: !!isFollowing, 
    isFollowedBy: !!isFollowedBy 
  });
});

const getSuggestions = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  // find all users I already follow
  const following = await Follow.find({ follower: myId }).select("following");
  const followingIds = following.map(f => f.following.toString());

  // exclude me + already followed
  const users = await User.find({
    _id: { $nin: [myId, ...followingIds] }
  })
    .select("userName profileImg isVerified")
    .limit(10); 

  res.json({ success: true, users });
});

export {
    followUser, unfollowUser, getFollowers, getFollowing, checkFollowStatus, getSuggestions,
}