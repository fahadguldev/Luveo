

import express from 'express';
import mongoose from 'mongoose';
import { cloudinaryConnect } from '../config/cloudinary.js';
import upload from '../middleware/multer.js';
import orderModel from '../models/Checkout.model.js';
import userModel from '../models/user.model.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import bcrypt from 'bcrypt';

import { addProduct, editProduct, deleteProduct } from '../controller/admin.product.controller.js';

const router = express.Router();
cloudinaryConnect();

router.post('/add-product', verifyAdmin, upload.any(), addProduct);
router.put('/edit-product/:id', verifyAdmin, upload.any(), editProduct);
router.delete('/delete-product/:id', verifyAdmin, deleteProduct);

router.post('/add-user', verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await user.save();

        const userWithoutPassword = { ...user._doc };
        delete userWithoutPassword.password;

        res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

router.post('/delete-user/:id', verifyAdmin, async (req, res) => {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
    try {
        const user = await userModel.findByIdAndDelete(userId);
        if (user) {
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User with this ID does not exist" });
        }
    } catch (error) {
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});

router.delete('/cancel-order/:id', verifyAdmin, async (req, res) => {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Invalid order ID format" });
    }
    try {
        const order = await orderModel.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({ message: "No order found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
