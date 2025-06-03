import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://crm-platform0.vercel.app';

// ===================== SIGNUP =====================
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Remove password from response
        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar
        };

        return res.status(201).json({ success: true, user: userResponse });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with this email.' });
        }

        // Check if user has a password (OAuth users might not)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account was created with Google. Please use Google Sign-In.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// ===================== GOOGLE OAUTH =====================

// Start Google OAuth flow
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

// Handle Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
        session: false,
    }),
    (req, res) => {
        try {
            const user = req.user;

            if (!user) {
                return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
            }

            const token = jwt.sign(
                { id: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/login?error=callback_failed`);
        }
    }
);

// ===================== LOGOUT =====================
router.post('/logout', (req, res) => {
    try {
        // Since we're using JWT, logout is handled client-side by removing the token
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// ===================== GET USER INFO =====================
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

export default router;