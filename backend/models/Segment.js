import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rules: { type: Array, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
}, { timestamps: true });

const Segment = mongoose.model('Segment', segmentSchema);
export default Segment;
