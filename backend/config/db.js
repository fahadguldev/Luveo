
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is not defined in environment variables");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 15, // Keeps connection pool well below MongoDB Atlas M0 (500 limit)
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
    }
};


