import asyncHandler from 'express-async-handler';
import cloudinary from '../utils/cloudinary.js';
import User from '../modals/userModal.js';


export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -__v -createdAt -updatedAt');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    userName: user.userName,
    email: user.email,
    role: user.role,
    profileImg: user.profileImg,
    location: user.location,
    bio: user.bio,
  });
});

export const getUserProfile= asyncHandler(async (req,res)=>{
  const user= await  User.findById(req.params.id)
  .select("-password -__v  -updatedAt");
  if (!user){
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    _id:user._id,
    userName:user.userName,
    profileImg:user.profileImg,
    location:user.location,
    bio:user.bio,
    isVerified:user.isVerified || false,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    createdAt:user.createdAt,
    email:user.email
    
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userName, location, bio, } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.userName = userName || user.userName;
  user.location = location || user.location;
  user.bio = bio || user.bio;

  const updatedUser = await user.save();

 res.json({
  success: true,
  message: 'Profile updated successfully',
  user: {
    _id: updatedUser._id,
    userName: updatedUser.userName,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImg: updatedUser.profileImg,
    location: updatedUser.location,
    bio: updatedUser.bio,
  }
});

});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

 try {
    // Delete old image if it exists
    if (user.profileImg) {
      const publicId = user.profileImg.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
    }

    // Update user with new image URL from Cloudinary
    user.profileImg = req.file.path; // Cloudinary URL from multer-storage-cloudinary
    const updatedUser = await user.save();

    console.log('Upload response:', {
      success: true,
      message: 'Image uploaded successfully',
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImg: updatedUser.profileImg,
        location: updatedUser.location,
        bio: updatedUser.bio,
      },
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImg: updatedUser.profileImg,
        location: updatedUser.location,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500);
    throw new Error('Failed to upload image');
  }
});


export const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.profileImg) {
    res.status(400);
    throw new Error('No profile image to delete');
  }

  const publicId = user.profileImg.split('/').pop().split('.')[0];
  await cloudinary.uploader.destroy(`user-profiles/${publicId}`);

  await user.save();

  res.json({ message: 'Image deleted successfully' });
});