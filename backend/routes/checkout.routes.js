import express from 'express';
import mongoose from 'mongoose';
import Checkout from '../models/Checkout.model.js';

const router = express.Router();

router.get('/order-products', async (req, res) => {
    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Valid order ID is required' });
    }

    try {
        const order = await Checkout.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order found', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;