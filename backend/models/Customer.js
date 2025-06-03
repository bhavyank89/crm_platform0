import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    joinedAt: { type: Date, default: Date.now },
    totalSpend: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
    lastActive: Date
});

const Customer = mongoose.model('Customer', CustomerSchema);
export default Customer;
