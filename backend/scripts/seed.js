import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import userModel from '../models/user.model.js';
import Product from '../models/product.model.js';
import checkoutModel from '../models/Checkout.model.js';
import Revenue from '../models/revenue.model.js';

dotenv.config();

export const seedDatabase = async () => {
    await connectDB();

    console.log('🌱 Starting database seed...');

    // 1. Seed Dummy Admin User
    const adminEmail = 'admin@luveo.shop';
    const adminPassword = 'Admin@123456';
    let admin = await userModel.findOne({ email: adminEmail });

    if (!admin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        admin = new userModel({
            name: 'Atelier Master Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            phone: '+923001234567',
            picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        });
        await admin.save();
        console.log(`✅ Admin account created: ${adminEmail} (password: ${adminPassword})`);
    } else {
        // Ensure role is admin
        if (admin.role !== 'admin') {
            admin.role = 'admin';
            await admin.save();
        }
        console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed Dummy Product
    const productName = 'Atelier MagFlap™ Executive Bifold';
    let product = await Product.findOne({ name: productName });

    if (!product) {
        product = new Product({
            name: productName,
            tagline: 'Hand-burnished Full-Grain Cowhide with MagSafe magnetic closure',
            category: 'magnetic-wallet',
            price: 4800,
            discountPrice: 3950,
            stock: 25,
            featured: true,
            visitCount: 142,
            colors: [
                {
                    name: 'Espresso Cognac',
                    hex: '#5B3A29',
                    images: [
                        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'
                    ]
                },
                {
                    name: 'Obsidian Noir',
                    hex: '#1A1817',
                    images: [
                        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
                    ]
                }
            ],
            features: [
                '100% Top-Grain Full Italian Leather',
                'Embedded N52 Neodymium Magnetic Alignment',
                'RFID-Shielded Interior Card Chamber',
                'Slim Profile (holds up to 10 cards + folded currency)'
            ],
            description: 'Crafted with obsessive precision, the Atelier MagFlap™ Executive Bifold fuses traditional artisanal hand-stitching with seamless magnetic convenience. Designed to age gracefully, developing an opulent patina over decades of use.',
            technicalSpecs: {
                material: 'Vegetable-tanned full-grain cowhide leather',
                dimensions: '10.5 cm x 7.5 cm x 1.2 cm',
                weight: '85 grams'
            }
        });
        await product.save();
        console.log(`✅ Dummy Product created: ${product.name} (PKR ${product.discountPrice})`);
    } else {
        console.log(`ℹ️ Dummy Product already exists: ${product.name}`);
    }

    // 3. Seed Dummy Order (in Checkout model)
    const orderEmail = 'patron.ahmed@example.com';
    let order = await checkoutModel.findOne({ email: orderEmail });

    if (!order) {
        order = new checkoutModel({
            userId: admin._id,
            name: 'Farhan Ahmed',
            email: orderEmail,
            phone: '+923123456789',
            address: 'House 42, Street 8, Sector F-7/2',
            city: 'Islamabad',
            province: 'Federal Capital',
            postalCode: '44000',
            orderStatus: 'delivered',
            totalAmount: product.discountPrice,
            orderedProducts: [
                {
                    productId: product._id,
                    productName: product.name,
                    productColor: 'Espresso Cognac',
                    productColorHex: '#5B3A29',
                    productQuantity: 1,
                    productPrice: product.discountPrice,
                    productImg: product.colors[0]?.images || []
                }
            ],
            orderDate: new Date()
        });
        await order.save();

        if (!admin.orderHistory.includes(order._id)) {
            admin.orderHistory.push(order._id);
            await admin.save();
        }

        console.log(`✅ Dummy Order created for: ${order.name} (PKR ${order.totalAmount})`);
    } else {
        console.log(`ℹ️ Dummy Order already exists for: ${orderEmail}`);
    }

    // 4. Update Revenue model
    let revenueDoc = await Revenue.findOne();
    if (!revenueDoc) {
        revenueDoc = new Revenue({ total: order ? order.totalAmount : product.discountPrice });
        await revenueDoc.save();
        console.log(`✅ Revenue record initialized at PKR ${revenueDoc.total}`);
    } else if (revenueDoc.total === 0) {
        revenueDoc.total = order ? order.totalAmount : product.discountPrice;
        await revenueDoc.save();
        console.log(`✅ Revenue record updated to PKR ${revenueDoc.total}`);
    } else {
        console.log(`ℹ️ Current total revenue: PKR ${revenueDoc.total}`);
    }

    console.log('🎉 Seeding completed successfully!');
    return {
        success: true,
        admin: { email: adminEmail, role: 'admin' },
        product: { id: product._id, name: product.name, price: product.discountPrice },
        order: { id: order._id, customer: order.name, total: order.totalAmount, status: order.orderStatus },
        revenue: revenueDoc.total
    };
};

if (process.argv[1]?.endsWith('seed.js')) {
    seedDatabase()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Seeding failed:', err);
            process.exit(1);
        });
}
