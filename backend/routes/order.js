import express from 'express';
// import { sendOrder } from '../kafka/producers/orderProducer.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// Create new order
router.post('/create', async (req, res) => {
    try {
        const { customerId, amount } = req.body;

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Order data is required' });
        }

        if (!customerId || !amount) {
            return res.status(400).json({ error: 'customerId and amount are required' });
        }

        // 1. Save order to MongoDB
        const order = await Order.create(req.body);

        // 2. Update Customer's totalSpend
        await Customer.findByIdAndUpdate(
            customerId,
            { $inc: { totalSpend: amount } },
            { new: true }
        );

        // 3. Send order to Kafka
        // await sendOrder(order);

        // 4. Respond to client
        res.status(201).json({
            message: 'Order saved, totalSpend updated, and order sent to Kafka',
            order,
        });
    } catch (err) {
        console.error('❌ Error handling order:', err.message);
        res.status(500).json({ error: 'Failed to handle order' });
    }
});

// ================= FETCH ALL ORDERS =================
router.get('/fetch', async (req, res) => {
    try {
        const orders = await Order.find().populate({
            path: 'customerId',
            select: 'name'
        }).sort({ createdAt: -1 }); // newest first
        res.status(200).json({ success: true, orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// ================= FETCH SINGLE ORDER BY ID =================
router.get('/fetch/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate({
            path: 'customerId',
            select: 'name'
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, order });
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
});

// ================= DELETE ORDER BY ID =================
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Decrement the totalSpend of the related Customer by the order amount
        await Customer.findByIdAndUpdate(
            deletedOrder.customerId,
            { $inc: { totalSpend: -deletedOrder.amount } },
            { new: true }
        );

        res.status(200).json({ success: true, message: 'Order deleted and customer totalSpend updated', order: deletedOrder });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
});


export default router;
