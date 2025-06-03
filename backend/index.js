import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import db from './config/db.js';
import './config/passport.js';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
import orderRoutes from './routes/order.js';
import segmentRoutes from './routes/segment.js';
import campaignRoutes from './routes/campaign.js';
import userRoutes from './routes/user.js';
import communicationLogRoute from './routes/communicationLog.js';
import venderRoute from './routes/vender.js';
import homeRoute from './routes/home.js';

dotenv.config();
db();

const app = express();
const PORT = process.env.PORT || 5000; // ✅ Uses .env PORT (default fallback to 5000)

app.use(
    cors({
        origin: '*', // Allow all origins
        credentials: false, // Still needed if you're sending cookies or auth headers
    })
);


app.use(express.json());
app.use(passport.initialize()); // ✅ Only use initialize (no session needed)

// API Routes
app.use('/', homeRoute);
app.use('/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/user', userRoutes);
app.use('/api/communicationLog', communicationLogRoute);
app.use('/api/vender', venderRoute);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // Optional: Start Kafka consumers
    // try {
    //     await startCustomerConsumer();
    //     await startOrderConsumer();
    //     console.log("✅ Kafka consumers started successfully");
    // } catch (error) {
    //     console.error("❌ Kafka consumer startup failed:", error);
    // }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT. Shutting down...');
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM. Shutting down...');
    process.exit();
});

export default app;
