import kafka from '../kafka.js';

const producer = kafka.producer();

let isConnected = false;

async function connectProducer() {
    if (!isConnected) {
        await producer.connect();
        isConnected = true;
    }
}

async function sendOrder(order) {
    try {
        await connectProducer();
        await producer.send({
            topic: 'orders',
            messages: [{ value: JSON.stringify(order) }],
        });
    } catch (error) {
        console.error('Failed to send order message:', error);
    }
}

async function disconnectProducer() {
    if (isConnected) {
        await producer.disconnect();
        isConnected = false;
    }
}

export { sendOrder, disconnectProducer };
