import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema(
    {
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        segmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Segment',
            required: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'SENT', 'FAILED'],
            default: 'PENDING',
        },
        sentAt: {
            type: Date,
        },
        deliveryResponse: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);
export default CommunicationLog;
