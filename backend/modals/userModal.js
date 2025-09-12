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
required: [
    function () {
      return this.provider === 'local';
    },
    'Password is required for local authentication',
  ],    minlength: [5, 'Password must be at least 5 characters'],
  },
  isVerified: {
    type:Boolean,
    default:false
  },
  isSubscribed: { type: Boolean, default: false },
  subscriptionId: { type: String, default: null }, // Stripe subscription id
  subscriptionPlan: { type: String, enum: ["monthly", "yearly", null], default: null },
subscriptionEnd: { type: Date, default: null },
  lastVerificationAttempt: {
  type: Date,
  select: false
},
verificationAttempts: {
  type: Number,
  default: 0,
  select: false,
  max: 5 // Prevent brute force
},

followersCount:{
type: Number,
default:0
},

followingCount:{
type: Number,
default:0
},

  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'moderator'],
      message: 'Invalid role specified'
    },
    default: 'user'
  },
  provider: {
      type: String,
      enum: ['google', 'facebook', 'local'],
      default: 'local',
    },
    providerId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values for non-social-auth users
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