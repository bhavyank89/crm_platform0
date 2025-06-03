import kafka from '../kafka.js';
import Order from '../../models/Order.js';

const consumer = kafka.consumer({ groupId: 'order-group' });

async function startOrderConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'orders', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());

                // Upsert based on orderId to avoid duplicates
                await Order.findOneAndUpdate(
                    { orderId: data.orderId },
                    data,
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error('Error processing order message:', err);
            }
        }
    });

    // Optional graceful shutdown
    process.on('SIGINT', async () => {
        await consumer.disconnect();
        process.exit(0);
    });
}

export default startOrderConsumer;
