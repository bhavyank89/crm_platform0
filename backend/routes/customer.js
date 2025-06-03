import express from 'express';
// import { sendCustomer } from '../kafka/producers/customerProducer.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// ===================== CREATE CUSTOMER =====================
router.post('/create', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const newCustomer = await Customer.create(req.body);
        // await sendCustomer(newCustomer); // Send to Kafka

        res.status(201).json({
            message: 'Customer created and sent to Kafka',
            customer: newCustomer,
        });
    } catch (err) {
        console.error('Error creating or sending customer:', err);
        res.status(500).json({ error: 'Failed to create or send customer' });
    }
});

// ===================== FETCH ALL CUSTOMERS =====================
router.get('/fetch', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch customers' });
    }
});

// ===================== FETCH SINGLE CUSTOMER BY ID =====================
router.get('/fetch/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);


        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({ success: true, customer });
    } catch (err) {
        console.error('Error fetching customer by ID:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch customer' });
    }
});

// ===================== DELETE CUSTOMER BY ID =====================
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCustomer = await Customer.findByIdAndDelete(id);

        if (!deletedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({ success: true, message: 'Customer deleted successfully', customer: deletedCustomer });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ success: false, error: 'Failed to delete customer' });
    }
});

export default router;
