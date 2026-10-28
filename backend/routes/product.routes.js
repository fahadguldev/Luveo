import express from 'express';
import mongoose from 'mongoose';
import productModel from '../models/product.model.js';
import userModel from '../models/user.model.js';
import {
    PRODUCT_CATEGORIES,
    isValidProductCategory,
    normalizeCategory,
} from '../constants/productCategories.js';

const router = express.Router();

// Category alias mapping for friendly navbar URLs
const CATEGORY_ALIASES = {
    'men': 'men-wallets',
    'women': 'women-bags',
    'gifting': 'accessories',
    'wallets': 'men-wallets',
    'belts': 'leather-belts',
    'bags': 'women-bags',
};

router.get('/test', (req, res) => {
    res.json({ message: "Product routes active" });
});

router.get('/get-products', async (req, res) => {
    try {
        const { featured, limit } = req.query;
        const query = {};

        if (typeof featured !== 'undefined') {
            query.featured = String(featured).toLowerCase() === 'true';
        }

        let productsQuery = productModel.find(query).sort({ createdAt: -1 });

        const parsedLimit = Number.parseInt(limit, 10);
        if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
            productsQuery = productsQuery.limit(parsedLimit);
        }

        const products = await productsQuery;
        res.status(200).json({
            message: 'Products fetched successfully',
            products: products || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/get-product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await productModel.findByIdAndUpdate(
            id,
            { $inc: { visitCount: 1 } },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product found", product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/get-selected-products", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(200).json([]);
        }

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return res.status(200).json([]);
        }

        const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id));
        const products = await productModel.find({ _id: { $in: objectIds } });
        res.json(products || []);
    } catch (error) {
        console.error("Error fetching selected products:", error);
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
});

router.post('/add-to-cart', async (req, res) => {
    try {
        const { productId, userId } = req.body;
        if (!productId || !userId) {
            return res.status(400).json({ message: "productId and userId are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.cart.push(productId);
        await user.save();
        res.json({ message: "Product added to cart successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/remove-from-cart', async (req, res) => {
    try {
        const { productId, userId } = req.body;
        if (!productId || !userId) {
            return res.status(400).json({ message: "productId and userId are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.cart.findIndex(id => id.toString() === productId.toString());
        if (index > -1) {
            user.cart.splice(index, 1);
            await user.save();
        }
        res.json({ message: "Product removed from cart successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/categories/:category', async (req, res) => {
    try {
        let categoryParam = normalizeCategory(req.params.category);
        // Resolve alias if used (e.g. 'men' -> 'men-wallets')
        if (CATEGORY_ALIASES[categoryParam]) {
            categoryParam = CATEGORY_ALIASES[categoryParam];
        }

        if (!isValidProductCategory(categoryParam)) {
            return res.status(400).json({
                message: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`,
                products: []
            });
        }

        const products = await productModel.find({ category: categoryParam });
        res.status(200).json({
            message: "Products found successfully",
            products: products || []
        });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;





