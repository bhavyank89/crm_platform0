import kafka from '../kafka.js';

const producer = kafka.producer();

let isConnected = false;

async function connectProducer() {
    if (!isConnected) {
        await producer.connect();
        isConnected = true;
    }
}

async function sendCustomer(customer) {
    try {
        await connectProducer();
        await producer.send({
            topic: 'customers',
            messages: [{ value: JSON.stringify(customer) }],
        });
    } catch (error) {
        console.error('Failed to send customer message:', error);
        // Optionally, implement retry logic or error handling here
    }
}

async function disconnectProducer() {
    if (isConnected) {
        await producer.disconnect();
        isConnected = false;
    }
}

export { sendCustomer, disconnectProducer };
