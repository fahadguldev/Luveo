import fs from 'fs';
import cloudinary, { cloudinaryConnect } from '../config/cloudinary.js';
import productModel from '../models/product.model.js';
import {
	PRODUCT_CATEGORIES,
	isValidProductCategory,
	normalizeCategory,
} from '../constants/productCategories.js';

// Ensure Cloudinary is ready for uploads
cloudinaryConnect();

const requiredSpecs = ['material', 'dimensions', 'weight', 'careInstructions'];

// Upload an array of files to Cloudinary, clean up local files, and return URLs
const uploadImgsToCloudinary = async (files) => {
	const uploadPromises = (files || []).map(async (file) => {
		try {
			const result = await cloudinary.uploader.upload(file.path);
			return result.secure_url;
		} finally {
			// Clean up local temp file to prevent disk leak
			await fs.promises.unlink(file.path).catch(() => {});
		}
	});
	return await Promise.all(uploadPromises);
};

// Clean up all local files in req.files if an error occurred before uploading
const cleanupFiles = async (files) => {
	if (!files || !Array.isArray(files)) return;
	for (const file of files) {
		if (file.path) {
			await fs.promises.unlink(file.path).catch(() => {});
		}
	}
};

// Group req.files by fieldname pattern colorImages_${index}
const groupFilesByColorIndex = (files) => {
	const byIndex = {};
	for (const file of files || []) {
		const match = file.fieldname.match(/^colorImages_(\d+)$/);
		if (match) {
			const idx = parseInt(match[1], 10);
			if (!byIndex[idx]) byIndex[idx] = [];
			byIndex[idx].push(file);
		}
	}
	return byIndex;
};

const validateColors = (colors) => {
	const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
	for (const color of colors) {
		if (!color.name || !color.hex) return 'Each color must have both a name and a hex value';
		if (!hexRegex.test(color.hex)) return `Invalid hex value for color: ${color.name}`;
	}
	return null;
};

export const addProduct = async (req, res) => {
	try {
		const productData = JSON.parse(req.body.productData);

		productData.featured = Boolean(productData.featured);

		if (!productData.name || !productData.price || !productData.description ||
			!productData.stock || !productData.category || !productData.tagline ||
			!productData.discountPrice) {
			return res.status(400).json({
				message: 'Name, tagline, price, discountPrice, stock, category, and description are required fields'
			});
		}

		productData.category = normalizeCategory(productData.category);

		if (!isValidProductCategory(productData.category)) {
			return res.status(400).json({
				message: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`
			});
		}

		// Normalize legacy key
		if (productData.color) {
			productData.colors = productData.color;
			delete productData.color;
		}

		if (!productData.colors || !Array.isArray(productData.colors)) {
			return res.status(400).json({ message: 'Colors must be an array of color objects with name and hex fields' });
		}

		const colorError = validateColors(productData.colors);
		if (colorError) return res.status(400).json({ message: colorError });

		if (!Array.isArray(productData.features) || productData.features.length === 0) {
			return res.status(400).json({ message: 'Features must be a non-empty array of strings' });
		}

		const specs = productData.technicalSpecs;
		if (!specs || requiredSpecs.some(key => !specs[key])) {
			return res.status(400).json({
				message: 'Technical specs must include material, dimensions, weight, and careInstructions'
			});
		}

		// Upload images per color
		const filesByColor = groupFilesByColorIndex(req.files);
		for (let i = 0; i < productData.colors.length; i++) {
			const files = filesByColor[i] || [];
			productData.colors[i].images = files.length ? await uploadImgsToCloudinary(files) : [];
		}

		const hasAnyImage = productData.colors.some(c => c.images && c.images.length > 0);
		if (!hasAnyImage) {
			return res.status(400).json({ message: 'At least one product image is required' });
		}

		const newProduct = new productModel({
			...productData,
			price: Number(productData.price),
			discountPrice: Number(productData.discountPrice),
			stock: Number(productData.stock),
			featured: Boolean(productData.featured),
		});

		const savedProduct = await newProduct.save();

		res.status(201).json({
			message: 'Product added successfully',
			product: savedProduct
		});
	} catch (error) {
		console.error('Product creation error:', error);
		res.status(500).json({ message: 'Failed to add product', error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	console.log(`Attempting to delete product with ID: ${req.params.id}`);
	try {
		const product = await productModel.findByIdAndDelete(req.params.id);

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		res.status(200).json({ message: 'Product deleted', product });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const editProduct = async (req, res) => {
	try {
		const productData = JSON.parse(req.body.productData);

		productData.featured = Boolean(productData.featured);

		if (!productData.name || !productData.price || !productData.description ||
			!productData.stock || !productData.category) {
			return res.status(400).json({ message: 'Name, price, stock, and description are required fields' });
		}

		productData.category = normalizeCategory(productData.category);

		if (!isValidProductCategory(productData.category)) {
			return res.status(400).json({
				message: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`
			});
		}

		// Normalize legacy key
		if (productData.color) {
			productData.colors = productData.color;
			delete productData.color;
		}

		if (!productData.colors || !Array.isArray(productData.colors)) {
			return res.status(400).json({ message: 'Colors must be an array of color objects with name and hex fields' });
		}

		const colorError = validateColors(productData.colors);
		if (colorError) return res.status(400).json({ message: colorError });

		// Build images per color from existing + new uploads minus removed
		const filesByColor = groupFilesByColorIndex(req.files);
		for (let i = 0; i < productData.colors.length; i++) {
			const existing = JSON.parse(req.body[`existingColorImages_${i}`] || '[]');
			const toRemove = JSON.parse(req.body[`colorImagesToRemove_${i}`] || '[]');
			const kept = existing.filter(url => !toRemove.includes(url));

			const newFiles = filesByColor[i] || [];
			const uploaded = newFiles.length ? await uploadImgsToCloudinary(newFiles) : [];

			productData.colors[i].images = [...kept, ...uploaded];
		}

		const updatedProduct = await productModel.findByIdAndUpdate(
			req.params.id,
			{ ...productData },
			{ new: true }
		);

		if (!updatedProduct) {
			return res.status(404).json({ message: 'Product not found' });
		}

		res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
	} catch (error) {
		console.error('Error while updating the product:', error);
		res.status(500).json({ message: 'Error while updating the product', error: error.message });
	}
};
