import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [5, 'Password must be at least 8 characters'],
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'moderator'],
      message: 'Invalid role specified'
    },
    default: 'user'
  },
  profileImg: {
    type: String,
    default: '/images/usersaleh.jpg',
    validate: {
      validator: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return value.startsWith('/');
        }
      },
      message: 'Invalid image URL format'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
}, {
  timestamps: true,

});

userSchema.index({ role: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;