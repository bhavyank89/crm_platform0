import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: String },
    amount: { type: Number, required: true },
    items: [{ type: String }],
    createdAt: {     type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
