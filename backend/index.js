import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load environment variables first
dotenv.config();

import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import AnalyticsRoutes from './routes/analytics.routes.js';
import { cloudinaryConnect } from './config/cloudinary.js';
import CheckoutRoutes from './routes/checkout.routes.js';
import VisitCounter from './models/visitCount.model.js';
import notificationRoutes from './routes/notification.routes.js';
import { initOrderChangeStream, closeOrderChangeStreams } from './services/orderStream.service.js';

// Initialize app
const app = express();
const server = http.createServer(app);

// Properly handle CORS origins
const baseOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://luveo-frontend.vercel.app",
    "https://luveo-frontend-git-animation-dev-rfguls-projects.vercel.app",
];

const allowedOrigins = [...baseOrigins];
if (process.env.FRONT_END_URL && !allowedOrigins.includes(process.env.FRONT_END_URL)) {
    allowedOrigins.push(process.env.FRONT_END_URL);
}

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Initialize Socket.io server with matching CORS configuration
const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 20000,
    pingInterval: 25000,
});

io.on('connection', (socket) => {
    // Admin dashboard joins 'admin_orders' room for scoped order notifications
    socket.on('join_admin_orders', () => {
        socket.join('admin_orders');
    });
});

app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Connect to database and services
connectDB();
cloudinaryConnect();
initOrderChangeStream(io);

// Use express.json() for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === '/payment/webhook') {
        next(); // Skip express.json for webhook route
    } else {
        express.json({ limit: "10mb" })(req, res, next);
    }
});

// Basic routes
app.get('/test', (req, res) => {
    res.send("Test route is working");
});

app.get('/', (req, res) => {
    res.send("The backend is working");
});

// API routes
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
app.use('/analytics', AnalyticsRoutes);
app.use('/checkout', CheckoutRoutes);
app.use('/notification', notificationRoutes);


// Global visit counter routes
app.get('/globalVisitCount', async (req, res) => {
    try {
        const countDoc = await VisitCounter.findOne({});
        res.status(200).json({ message: countDoc || { globalVisitCount: 0 } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put('/updateGlobalVisitCount', async (req, res) => {
    try {
        const updated = await VisitCounter.findOneAndUpdate(
            {},
            {
                $inc: { globalVisitCount: 1 },
                $set: { lastUpdated: new Date() }
            },
            { new: true, upsert: true }
        );

        res.json({
            visitorCount: updated.globalVisitCount,
            lastUpdated: updated.lastUpdated,
        });
    } catch (err) {
        console.error("Error updating visit count:", err);
        res.status(500).json({ error: 'Error updating visit count' });
    }
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
const port = process.env.PORT || process.env.LOCALHOST || 5000;
server.listen(port, () => {
    console.log(`✅ Backend server running on port: ${port}`);
});

// Graceful cleanup on shutdown
const handleGracefulShutdown = async () => {
    await closeOrderChangeStreams();
    io.close();
};
process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);

export { server, io };
export default app;
