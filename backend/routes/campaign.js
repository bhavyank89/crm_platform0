import express from 'express';
import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import CommunicationLog from '../models/CommunicationLog.js';
import buildCampaignMessage from '../utils/buildCampaignMessage.js';
import suggestMessageTemplete from '../utils/suggestMessageTemplete.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL;

// CREATE CAMPAIGN AND SEND MESSAGES
router.post('/create', async (req, res) => {
    try {
        const { name, messageTemplate, segmentId, createdBy } = req.body;

        if (!name || !messageTemplate || !segmentId || !createdBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Fetch segment
        const segment = await Segment.findById(segmentId);
        if (!segment) return res.status(404).json({ error: 'Segment not found' });

        const segmentName = segment.name;
        const rulesDescription = segment.rules[0] || 'No rule description available';
        const customerIds = segment.customerIds;

        // 2. Create campaign
        const campaign = await Campaign.create({
            name,
            messageTemplate,
            segmentId,
            createdBy
        });

        // 3. Process each customer
        for (const customerId of customerIds) {
            try {
                const customer = await Customer.findById(customerId);
                if (!customer) {
                    console.warn(`⚠️ Customer not found: ${customerId}`);
                    continue;
                }

                const personalizedContent = await buildCampaignMessage({
                    segmentName,
                    rulesDescription,
                    customerName: customer.name
                });

                const { message } = personalizedContent;

                const log = await CommunicationLog.create({
                    campaignId: campaign._id,
                    segmentId: segment._id,
                    customerId: customer._id,
                    message,
                    status: 'PENDING'
                });

                // 4. Send to Vendor API and handle response
                try {
                    const response = await fetch(`${BACKEND_URL}/api/vendor/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customerId: customer._id,
                            logId: log._id,
                            message
                        })
                    });

                    if (!response.ok) {
                        console.warn(`⚠️ Vendor API error for customer ${customerId}`);
                    } else {
                        console.log(`📤 Message sent to vendor for customer ${customerId}`);
                    }
                } catch (fetchErr) {
                    console.error(`❌ Vendor API call failed for ${customerId}:`, fetchErr.message);
                }

            } catch (err) {
                console.error(`❌ Error processing customer ${customerId}:`, err.message);
            }
        }

        res.json({ success: true, campaignId: campaign._id });

    } catch (err) {
        console.error('❌ Error creating campaign:', err);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// RECEIVE RECEIPT FROM VENDOR
router.put('/receipt', async (req, res) => {
    const { logId, status, vendorMessage } = req.body;

    try {
        await CommunicationLog.findByIdAndUpdate(logId, {
            status,
            sentAt: new Date(),
            deliveryResponse: { vendorMessage }
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Receipt Error:', err);
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

// FETCH CAMPAIGN HISTORY
router.get('/history', async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate({
            path: 'createdBy',
            select: 'name'
        }).sort({ createdAt: -1 });

        const campaignDetails = await Promise.all(
            campaigns.map(async (camp) => {
                const logs = await CommunicationLog.find({ campaignId: camp._id });
                const sent = logs.filter(log => log.status === 'SENT').length;
                const failed = logs.filter(log => log.status === 'FAILED').length;
                const pending = logs.filter(log => log.status === 'PENDING').length;

                const segment = await Segment.findById(camp.segmentId);

                return {
                    _id: camp._id,
                    name: camp.name,
                    messageTemplate: camp.messageTemplate,
                    createdBy: camp.createdBy,
                    createdAt: camp.createdAt,
                    segmentName: segment?.name || 'Deleted Segment',
                    stats: {
                        total: logs.length,
                        sent,
                        failed,
                        pending
                    }
                };
            })
        );

        res.json(campaignDetails);
    } catch (err) {
        console.error('❌ Error fetching campaign history:', err);
        res.status(500).json({ error: 'Failed to fetch campaign history' });
    }
});

// GET LOGS FOR A CAMPAIGN
router.get('/logs/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const logs = await CommunicationLog.find({ campaignId }).populate('customerId', 'name email');

        const response = logs.map(log => ({
            _id: log._id,
            customerName: log.customerId?.name || 'Unknown',
            message: log.message,
            status: log.status,
            createdAt: log.createdAt,
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch campaign logs' });
    }
});

router.post('/messageTemplete', async (req, res) => {
    try {
        const { title, segment } = req.body;

        if (!title || !segment) {
            return res.status(400).json({ error: 'Both title and segment are required.' });
        }

        const messageTemplate = await suggestMessageTemplete({ title, segment });

        res.json({ messageTemplate });
    } catch (err) {
        console.error('❌ Error generating message template:', err);
        res.status(500).json({ error: 'Failed to generate message template.' });
    }
});


export default router;
