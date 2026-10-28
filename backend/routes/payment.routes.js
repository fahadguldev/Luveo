
import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Order from '../models/order.model.js';
import AdminMsg from '../models/adminMsg.model.js';
import Revenue from '../models/revenue.model.js';
import productModel from '../models/product.model.js';

const router = express.Router();

// Payment route
router.post("/makePayment", async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: "Stripe secret key not configured" });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { products, userId, address } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid product data" });
        }

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Verify genuine prices and stock from MongoDB database (prevent client price manipulation)
        const lineItems = [];
        const minimalProducts = [];

        for (const item of products) {
            const prodId = item.id || item._id || item.productId;
            if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
                return res.status(400).json({ error: `Invalid product ID: ${prodId}` });
            }

            const dbProduct = await productModel.findById(prodId);
            if (!dbProduct) {
                return res.status(404).json({ error: `Product not found: ${prodId}` });
            }

            const genuinePrice = Number(dbProduct.discountPrice || dbProduct.price);
            if (isNaN(genuinePrice) || genuinePrice <= 0) {
                return res.status(400).json({ error: `Invalid price configuration for ${dbProduct.name}` });
            }

            const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;

            let imageUrl = [];
            if (dbProduct.colors?.[0]?.images?.[0]) {
                imageUrl = [dbProduct.colors[0].images[0]];
            }

            lineItems.push({
                price_data: {
                    currency: "AED",
                    product_data: {
                        name: dbProduct.name,
                        images: imageUrl,
                    },
                    unit_amount: Math.round(genuinePrice * 100),
                },
                quantity,
            });

            minimalProducts.push({
                id: dbProduct._id,
                name: dbProduct.name,
                price: genuinePrice,
                quantity,
            });
        }

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['AE'],
            },
            line_items: lineItems,
            success_url: `${process.env.FRONT_END_URL || 'http://localhost:5173'}/payment/success`,
            cancel_url: `${process.env.FRONT_END_URL || 'http://localhost:5173'}/payment/cancel`,
            metadata: {
                userId: String(userId),
                products: JSON.stringify(minimalProducts),
                address: typeof address === 'string' ? address : JSON.stringify(address || {}),
            },
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error("Payment Error:", error.message);
        res.status(500).json({
            error: "Failed to create Stripe session",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Webhook route - needs raw body
router.post("/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        if (!sig) return res.status(400).send("Stripe signature missing");

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata || {};

            try {
                if (!metadata.userId || !metadata.products) {
                    console.error("Missing required metadata in webhook");
                    return res.status(200).json({ received: true });
                }

                let products;
                try {
                    products = JSON.parse(metadata.products);
                } catch (e) {
                    console.error("Failed to parse products JSON:", e);
                    return res.status(200).json({ received: true });
                }

                // ✅ Get line items
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                    limit: 100,
                });

                const order = new Order({
                    customer_email: session.customer_details?.email || null,
                    shipping: session.shipping || {},
                    billing_details: {
                        address: session.customer_details?.address || {},
                        email: session.customer_details?.email || null,
                        name: session.customer_details?.name || null,
                        phone: session.customer_details?.phone || null
                    },
                    line_items: lineItems.data.map(item => ({
                        id: item.id,
                        description: item.description,
                        amount_subtotal: item.amount_subtotal,
                        amount_total: item.amount_total,
                        currency: item.currency,
                        quantity: item.quantity,
                        price: {
                            id: item.price?.id,
                            unit_amount: item.price?.unit_amount,
                            currency: item.price?.currency,
                            product: item.price?.product
                        }
                    })),
                    amount_total: session.amount_total,
                    payment_status: session.payment_status,
                    payment_intent: session.payment_intent
                });
                console.log(order)
                let savedOrder;
                try {
                    savedOrder = await order.save();
                    console.log('✅ Order saved!', savedOrder._id);
                } catch (error) {
                    console.error('❌ Order save error:', error.message);
                    console.error('Full error:', error);
                }


                // Admin Message
                await AdminMsg.create({
                    userId: metadata.userId,
                    message: `New order: ${session.id}`,
                    orderId: savedOrder._id,
                    createdAt: new Date()
                });

                // Revenue update
                const revenueDoc = await Revenue.findOne();
                if (revenueDoc) {
                    revenueDoc.total += session.amount_total / 100;
                    await revenueDoc.save();
                } else {
                    await Revenue.create({
                        total: session.amount_total / 100,
                        updatedAt: new Date()
                    });
                }

                console.log("✅ Order and admin updates complete");
            } catch (err) {
                console.error("❌ Order handling failed:", err);
            }
        }

        res.status(200).json({ received: true });
    }
);

export default router;