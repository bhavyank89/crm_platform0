import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL;

router.post('/send', async (req, res) => {
    const { logId, customerId, message } = req.body;

    // Simulate ~90% delivery success
    const isSuccess = Math.random() < 0.9;

    setTimeout(() => {
        fetch(`${BACKEND_URL}/api/campaign/receipt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                logId,
                status: isSuccess ? 'SENT' : 'FAILED',
                vendorMessage: isSuccess ? 'Delivered' : 'Failed to deliver'
            })
        }).then(res => res.json())
            .then(data => console.log('📬 Receipt sent:', data))
            .catch(err => console.error('❌ Failed to send receipt:', err));
    }, 1000);


    res.json({ success: true });
});

export default router;
