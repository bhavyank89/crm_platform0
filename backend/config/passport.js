import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const CLIENT_ID = process.env.G_CLIENT_ID;
const CLIENT_SECRET = process.env.G_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'https://crmplatform-production.up.railway.app';

if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing required Google OAuth environment variables: G_CLIENT_ID and G_CLIENT_SECRET');
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.G_CLIENT_ID,
            clientSecret: process.env.G_CLIENT_SECRET,
            callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Check if user exists with same email (for account linking)
                    const existingUser = await User.findOne({
                        email: profile.emails?.[0]?.value
                    });

                    if (existingUser) {
                        // Link Google account to existing user
                        existingUser.googleId = profile.id;
                        existingUser.avatar = existingUser.avatar || profile.photos?.[0]?.value || '';
                        user = await existingUser.save();
                    } else {
                        // Create new user
                        user = await User.create({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails?.[0]?.value || '',
                            avatar: profile.photos?.[0]?.value || '',
                            // No password for OAuth users
                        });
                    }
                }

                return done(null, user);
            } catch (err) {
                console.error('Error in GoogleStrategy:', err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error('Error in deserializeUser:', err);
        done(err, null);
    }
});