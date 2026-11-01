import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('❌ Error: MONGO_URI is missing in backend/.env');
    console.error('Please configure your database connection before creating an admin.');
    process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
========================================================
👑 Luveo Admin Creation Script - Usage Guide
========================================================
Syntax:
  node scripts/createAdmin.js <email> <password> [name]

Examples:
  # 1. Default admin account:
  pnpm run create-admin

  # 2. Custom admin account:
  node scripts/createAdmin.js admin@luveo.com MySecurePassword123 "Store Administrator"

  # 3. Promote an existing registered user to admin:
  node scripts/createAdmin.js existinguser@gmail.com
========================================================
`);
    process.exit(0);
}

// Arguments: node scripts/createAdmin.js <email> <password> [name]
const email = args[0] || 'admin@luveo.com';
const password = args[1] || 'Admin123!';
const name = args[2] || 'Store Administrator';

console.log('========================================================');
console.log('👑 Luveo Admin Creation Script');
console.log('========================================================');
console.log(`👤 Target Email: ${email}`);
console.log(`🏷️ Name:         ${name}`);
console.log('========================================================');

const createOrPromoteAdmin = async () => {
    try {
        console.log('⏳ Connecting to database...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB.');

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            console.log(`ℹ️ User with email "${normalizedEmail}" found.`);
            if (existingUser.role === 'admin') {
                console.log('✅ This user is ALREADY an admin.');
            } else {
                existingUser.role = 'admin';
                await existingUser.save();
                console.log(`🎉 Successfully promoted "${normalizedEmail}" to role: "admin"!`);
            }

            // Optionally update password if provided explicitly as argument
            if (args[1]) {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.password = hashedPassword;
                await existingUser.save();
                console.log('🔑 Password has been updated.');
            }
        } else {
            console.log(`Creating new admin account for "${normalizedEmail}"...`);
            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = new User({
                name: name.toLowerCase().trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: 'admin',
                authProvider: 'local',
                isActive: true,
            });

            await newAdmin.save();
            console.log('🎉 Admin account successfully created!');
        }

        console.log('========================================================');
        console.log('👉 Next Steps:');
        console.log(`   1. Open the frontend login page (e.g. http://localhost:5173/login)`);
        console.log(`   2. Sign in with:`);
        console.log(`      Email:    ${email}`);
        console.log(`      Password: ${args[1] ? password : (existingUser ? '[Existing Password]' : password)}`);
        console.log(`   3. Access the Admin Dashboard at: http://localhost:5173/admin`);
        console.log('========================================================');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create/promote admin:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Ensure MongoDB is running or verify MONGO_URI in backend/.env');
        }
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
};

createOrPromoteAdmin();
