import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;

console.log('========================================================');
console.log('🔍 Luveo Database Connection Diagnostics');
console.log('========================================================');

if (!uri) {
    console.error('❌ MONGO_URI is missing from backend/.env');
    console.error('👉 Please add MONGO_URI to backend/.env');
    console.error('   Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/luveo?retryWrites=true&w=majority');
    process.exit(1);
}

// Sanitize display URI
const sanitized = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log(`📡 Target URI: ${sanitized}`);

const runCheck = async () => {
    const startTime = Date.now();
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });

        const elapsed = Date.now() - startTime;
        console.log(`✅ MongoDB connected successfully in ${elapsed}ms!`);
        console.log(`📦 Database name: ${mongoose.connection.name}`);
        console.log(`🟢 Connection state: Ready (${mongoose.connection.readyState})`);
        await mongoose.disconnect();
        console.log('========================================================');
        process.exit(0);
    } catch (err) {
        const elapsed = Date.now() - startTime;
        console.error(`\n❌ Connection failed after ${elapsed}ms:`, err.message);
        console.log('\n🛠️ Troubleshooting Guide:');

        if (err.message.includes('ECONNREFUSED')) {
            console.log('  • You are using a local MongoDB connection (localhost:27017), but MongoDB is not running.');
            console.log('  • Solution A: Start local MongoDB service or Docker container:');
            console.log('      docker run -d -p 27017:27017 --name mongodb mongo:latest');
            console.log('  • Solution B: Use MongoDB Atlas (free cloud database):');
            console.log('      Set MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/luveo');
        } else if (err.message.includes('buffering timed out') || err.message.includes('Server selection timed out')) {
            console.log('  • The connection timed out reaching your MongoDB Atlas cluster.');
            console.log('  • Check 1: MongoDB Atlas Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0).');
            console.log('  • Check 2: Verify your internet connection or corporate VPN / firewall blocking port 27017.');
        } else if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
            console.log('  • Database credentials are incorrect.');
            console.log('  • Check username and password in MongoDB Atlas -> Database Access.');
            console.log('  • If password has special characters (@, #, :, /, %), URL-encode them.');
        }

        console.log('========================================================');
        process.exit(1);
    }
};

runCheck();
