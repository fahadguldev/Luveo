import express from 'express';
import Notification from '../models/notification.model.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

// ✅ Create or Update Notification (Upsert) - Admin only
router.post('/add-notification', verifyAdmin, async (req, res) => {
    const { message, timer, type } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const updated = await Notification.findByIdAndUpdate(
            'singleton',
            { message, timer, type },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Update failed', details: err.message });
    }
});

// ✅ Get the current notification (Public)
router.get('/notification', async (req, res) => {
    try {
        const notification = await Notification.findById('singleton');
        if (!notification) {
            return res.status(200).json(null);
        }
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Delete the current notification - Admin only
router.delete('/delete-notification', verifyAdmin, async (req, res) => {
    try {
        await Notification.findByIdAndDelete('singleton');
        res.status(204).send(); // No Content
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

export default router;
