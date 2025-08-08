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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails?.[0]?.value) {
          return done(null, false, { message: 'Email not provided by Google' });
        }
        let user = await User.findOne({
          email: profile.emails[0].value, // Search by email only
        });
        if (!user) {
          user = await User.create({
            userName: profile.displayName,
            email: profile.emails[0].value,
            profileImg: profile.photos?.[0]?.value || '/images/usersaleh.jpg',
            isVerified: true,
            provider: 'google',
            providerId: profile.id,
          });
        } else {
          // Update provider and providerId if not already set for Google
          if (!user.providerId || user.provider !== 'google') {
            user.provider = 'google';
            user.providerId = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (err) {
        console.error('Google Strategy Error:', err.message, err.stack);
        return done(err, null);
      }
    }
  )
);

passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Facebook Profile:', profile);
          const email = profile.emails && profile.emails[0]?.value;
          const profilePicture = profile.photos && profile.photos[0]?.value;
          if (!email) {
            return done(new Error('Email not provided by Facebook'), null);
          }
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              userName: profile.displayName,
              email: email,
              profileImg: profilePicture || 'https://graph.facebook.com/v20.0/me/picture?type=large', // Fallback to default Facebook picture
              isVerified: true,
            });
          } else {
            // Update profileImg to ensure Facebook picture is used
            user.profileImg = profilePicture || 'https://graph.facebook.com/v20.0/me/picture?type=large';
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );