import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../modals/userModal.js';
import dotenv from 'dotenv';
dotenv.config();
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { email: profile.emails[0].value },
        { providerId: profile.id }
      ]
    });
    
    if (!user) {
      user = await User.create({
        userName: profile.displayName,
        email: profile.emails[0].value,
        profileImg: profile.photos[0].value,
        isVerified: true,
        provider: 'google',
        providerId: profile.id
      });
    } else if (user.provider !== 'google') {
      return done(null, false, { message: 'Email already registered' });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile.emails?.[0]?.value) {
      return done(null, false, { message: 'No email found' });
    }

    let user = await User.findOne({ 
      $or: [
        { email: profile.emails[0].value },
        { providerId: profile.id }
      ]
    });
    
    if (!user) {
      user = await User.create({
        userName: profile.displayName,
        email: profile.emails[0].value,
        profileImg: profile.photos[0]?.value || '',
        isVerified: true,
        provider: 'facebook',
        providerId: profile.id
      });
    } else if (user.provider !== 'facebook') {
      return done(null, false, { message: 'Email already registered' });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));