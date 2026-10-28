import express from 'express';
import mongoose from 'mongoose';
import Revenue from '../models/revenue.model.js';
import checkoutModel from '../models/Checkout.model.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/total-revenue', verifyAdmin, async (req, res) => {
    try {
        const revenueDoc = await Revenue.findOne();
        const total = revenueDoc?.total || 0;
        res.status(200).json({ message: "fetched revenue successfully", totalRevenue: total });
    } catch (error) {
        console.error('Failed to fetch revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/all-orders', verifyAdmin, async (req, res) => {
    try {
        const orders = await checkoutModel.find({}).sort({ orderDate: -1 });
        res.status(200).json({ message: "Found orders successfully", orders: orders || [] });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/update-order-status', verifyAdmin, async (req, res) => {
    const { orderID, orderStatus } = req.body;
    const allowedStatuses = ['pending', 'packing', 'shipped', 'delivered', 'cancelled'];

    if (!orderID || !orderStatus) {
        return res.status(400).json({ message: "Both order id and order status are required" });
    }

    const normalizedStatus = orderStatus.toLowerCase();
    if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
            message: `Invalid order status. Allowed: ${allowedStatuses.join(', ')}`
        });
    }

    if (!mongoose.Types.ObjectId.isValid(orderID)) {
        return res.status(400).json({ message: "Invalid order ID format" });
    }

    try {
        const existingOrder = await checkoutModel.findById(orderID);
        if (!existingOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const previousStatus = existingOrder.orderStatus;
        existingOrder.orderStatus = normalizedStatus;
        await existingOrder.save();

        // Only add revenue when transitioning to delivered
        if (normalizedStatus === 'delivered' && previousStatus !== 'delivered') {
            await Revenue.findOneAndUpdate(
                {},
                { $inc: { total: Number(existingOrder.orderTotal) || 0 } },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order: existingOrder
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;