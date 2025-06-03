import Customer from '../../models/Customer.js';
import kafka from '../kafka.js';

const consumer = kafka.consumer({ groupId: 'customer-group' });

async function startCustomerConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'customers', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());

                // Upsert customer data by email to avoid duplicates
                await Customer.findOneAndUpdate(
                    { email: data.email },
                    data,
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error('Error processing customer message:', err);
            }
        }
    });

    // Optional: graceful shutdown
    process.on('SIGINT', async () => {
        await consumer.disconnect();
        process.exit(0);
    });
}

export default startCustomerConsumer;
