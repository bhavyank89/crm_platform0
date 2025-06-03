import express from 'express';
import CommunicationLog from '../models/CommunicationLog.js';

const router = express.Router();

router.get('/fetch', async (req, res) => {
    try {
        const logs = await CommunicationLog.find()
            .populate({ path: "customerId", select: "name email" })
            .populate("segmentId", "name")
            .populate("campaignId", "name")
            .sort({ createdAt: -1 }); // latest first
        res.status(200).json({ success: true, logs });
    } catch (err) {
        console.error('Error fetching communication logs:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch communication logs' });
    }
});

export default router;
