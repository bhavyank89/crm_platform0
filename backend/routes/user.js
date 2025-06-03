import express from 'express';
import User from '../models/User.js'; // Adjust the path if needed
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ===================== FETCH SINGLE USER BY ID =====================
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required in URL params" });
        }

        const user = await User.findById(userId).populate();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ===================== FETCH ALL USERS =====================
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ===================== DELETE USER BY ID =====================
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// fetch user from JWT token 
router.post("/fetch", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token is required in request body" });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user,
        });
    } catch (err) {
        console.error("Error fetching user from token:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
