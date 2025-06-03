import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'xeno-crm',
    brokers: [process.env.KAFKA_BROKER]
});
export default kafka;
