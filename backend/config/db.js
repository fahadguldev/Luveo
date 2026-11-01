import mongoose from 'mongoose';

// Disable Mongoose command buffering so queries fail-fast rather than hanging for 10,000ms if disconnected
mongoose.set('bufferCommands', false);

// Global connection cache across invocations (optimized for Vercel/serverless & persistent Node instances)
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Returns true if Mongoose has an active, ready connection (readyState 1)
 */
export const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Connect to MongoDB with connection pooling, timeout bounds, and reconnect listeners.
 */
export const connectDB = async () => {
    if (cached.conn && isDbConnected()) {
        return cached.conn;
    }

    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not defined in environment variables. Please check your backend .env file.");
        return null;
    }

    if (!cached.promise) {
        const opts = {
            maxPoolSize: 10, // Keeps connection pool well below MongoDB Atlas M0 (500 limit)
            minPoolSize: 0, // Do not maintain idle sockets in serverless
            serverSelectionTimeoutMS: 30000, // Timeout after 30s instead of 5s to allow serverless cold starts
            socketTimeoutMS: 45000,
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((m) => {
                console.log("✅ Database connected successfully");
                return m;
            })
            .catch((error) => {
                console.error("❌ Database connection error:", error.message);
                console.error("💡 Action required: Check MONGO_URI in backend/.env or whitelist IP (0.0.0.0/0) in MongoDB Atlas.");
                cached.promise = null; // Reset so subsequent requests can retry
                return null;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch {
        cached.promise = null;
        return null;
    }

    return cached.conn;
};

// Lifecycle listeners for connection resilience
mongoose.connection.on('disconnected', () => {
    console.warn("⚠️ [MongoDB] Disconnected from database.");
    if (cached) {
        cached.conn = null;
        cached.promise = null;
    }
});

mongoose.connection.on('reconnected', () => {
    console.log("✅ [MongoDB] Reconnected successfully.");
});
