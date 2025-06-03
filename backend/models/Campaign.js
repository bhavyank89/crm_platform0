import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        messageTemplate: { type: String, required: true },
        segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
