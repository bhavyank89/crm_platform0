import mongoose from 'mongoose';

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
    }
};

export default connectToDB;