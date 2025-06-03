// server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
        },
        password: {
            type: String,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
