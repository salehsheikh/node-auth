import asyncHandler from  'express-async-handler';
import User from '../modals/userModal.js';
import Follow from '../modals/followModel.js';
import Notification from '../modals/NotificationModel.js';
const followUser= asyncHandler(async(req,res)=>{
const {userId}= req.params;
const followerId= req.user._id;
if (userId === followerId.toString()){
    return res.status(400).json({
        success:false,
        message: "You cannot follow yourself"
    });
}

const userToFollow = await User.findById(userId);
if( !userToFollow){
    return res.status(404).json({
        success:false,
        message:"User not found"
    });
}

const existingFollow = await Follow.isFollowing(followerId, userId);
if (existingFollow){
    return res.status(400).json({
        succes:false,
        message:'You are already following this user'

    });
}

const follow= await Follow.create({
    follower:followerId,
    following:userId
});


const populatedFollow= await Follow.findById(follow._id)
.populate('follower', 'userName profileImg isVerified')
.populate('following', 'userName profileImg' );
await User.findByIdAndUpdate(followerId, {$inc:{followingCount:1}});
await User.findByIdAndUpdate(userId, {$inc:{ followersCount:1}});

const notification= await Notification.create({
    recipient:userId,
    sender:followerId,
    type:'follow',
    message:`${populatedFollow.follower.userName} started following you`,
    relatedItem:follow._id,
    itemType:'user'
});

const populatedNotification= await Notification.findById(notification._id)
.populate('sender', 'userName profileImg isVerified')
.populate('recipient', 'userName profileImg');
const io= req.app.get('io');
if (io){
    io.to(userId.toString()).emit('new-follow',{
        message:`${populatedFollow.follower.userName} started following you`,
        follow:populatedFollow,
        notification:populatedNotification
    });

    io.emit('follow-update',{
        type:'follow',
        followerId:followerId.toString(),
        followingId:userId.toString(),
        follower:populatedFollow.follower,
        following:populatedFollow.following
    });
}


res.status(201).json({
    success:true,
    message:`you are now following ${userToFollow.userName}`,
    data:follow
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

const checkFollowStatus= asyncHandler( async (req,res)=>{
    const {userId}= req.params;
    const followerId= req.user._id;
    const isFollowing= await Follow.isFollowing(followerId , userId);
    res.json({
        succes:true,
        isFollowing: !!isFollowing
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
    .limit(10); // limit suggestions

  res.json({ success: true, users });
});

export {
    followUser, unfollowUser, getFollowers, getFollowing, checkFollowStatus, getSuggestions,
}