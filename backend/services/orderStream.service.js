/**
 * services/orderStream.service.js
 * 
 * Persistent MongoDB Change Stream listener with auto-reconnect, resume token caching,
 * and Socket.io real-time order broadcasting.
 * Optimized for MongoDB Atlas Free Tier (M0) connection efficiency.
 */

import mongoose from 'mongoose';

// Map of collectionName -> { stream, resumeToken, reconnectTimeout, attempts }
const streamState = {
    orders: { stream: null, resumeToken: null, timeout: null, attempts: 0 },
    checkouts: { stream: null, resumeToken: null, timeout: null, attempts: 0 }
};

const MAX_BACKOFF_DELAY_MS = 30000; // Cap backoff at 30 seconds

/**
 * Creates and manages a Change Stream on a specific collection
 * @param {string} collectionName - e.g. 'orders' or 'checkouts'
 * @param {import('socket.io').Server} io - Socket.io server instance
 */
const watchCollection = (collectionName, io) => {
    const state = streamState[collectionName];
    if (!state) return;

    // Wait until mongoose connection is fully established (readyState 1 = connected)
    if (mongoose.connection.readyState !== 1) {
        mongoose.connection.once('connected', () => watchCollection(collectionName, io));
        return;
    }

    try {
        const collection = mongoose.connection.collection(collectionName);

        // Filter: ONLY listen for 'insert' operations
        const pipeline = [
            {
                $match: {
                    operationType: 'insert'
                }
            }
        ];

        // Options: resume token for resilient reconnects + full document retrieval
        const options = {
            fullDocument: 'updateLookup',
            ...(state.resumeToken ? { resumeAfter: state.resumeToken } : {})
        };

        console.log(`🔄 [ChangeStream] Watching collection '${collectionName}' for new orders...`);
        const stream = collection.watch(pipeline, options);
        state.stream = stream;

        // On new inserted document
        stream.on('change', (change) => {
            // Save resume token for resilient recovery if connection blips
            state.resumeToken = change._id;
            state.attempts = 0; // Reset backoff counter on successful event

            const fullDoc = change.fullDocument;
            console.log(`📦 [ChangeStream:${collectionName}] New order captured:`, fullDoc?._id || 'unknown');

            // Broadcast to connected admin clients
            // 1. Emit to dedicated admin room
            io.to('admin_orders').emit('new_order', fullDoc);
            // 2. Also emit to general socket listeners for compatibility
            io.emit('new_order', fullDoc);
        });

        // On stream error (e.g., Atlas primary node election, network glitch)
        stream.on('error', (err) => {
            console.error(`❌ [ChangeStream:${collectionName}] Error:`, err.message);
            scheduleReconnect(collectionName, io);
        });

        // On stream close
        stream.on('close', () => {
            console.warn(`⚠️ [ChangeStream:${collectionName}] Cursor closed.`);
            scheduleReconnect(collectionName, io);
        });

    } catch (err) {
        console.error(`❌ [ChangeStream:${collectionName}] Failed to initialize:`, err.message);
        scheduleReconnect(collectionName, io);
    }
};

/**
 * Handles reconnecting a collection stream with exponential backoff
 */
const scheduleReconnect = (collectionName, io) => {
    const state = streamState[collectionName];
    if (!state || state.timeout) return;

    if (state.stream) {
        try {
            state.stream.close();
        } catch (_) {
            // Cursor may already be dead
        }
        state.stream = null;
    }

    const delay = Math.min(1000 * Math.pow(2, state.attempts), MAX_BACKOFF_DELAY_MS);
    state.attempts++;

    console.log(`⏳ [ChangeStream:${collectionName}] Reconnecting in ${delay / 1000}s (Attempt ${state.attempts})...`);

    state.timeout = setTimeout(() => {
        state.timeout = null;
        watchCollection(collectionName, io);
    }, delay);
};

/**
 * Initialize order change streams for all order collections ('orders' and 'checkouts')
 * @param {import('socket.io').Server} io
 */
export const initOrderChangeStream = (io) => {
    // Primary 'orders' collection (per specification)
    watchCollection('orders', io);
    // Also watch 'checkouts' collection (which Luveo uses for direct checkouts)
    watchCollection('checkouts', io);
};

/**
 * Cleanly close all active change streams upon server shutdown
 */
export const closeOrderChangeStreams = async () => {
    for (const [name, state] of Object.entries(streamState)) {
        if (state.timeout) {
            clearTimeout(state.timeout);
            state.timeout = null;
        }
        if (state.stream) {
            try {
                await state.stream.close();
                console.log(`🛑 [ChangeStream:${name}] Closed successfully.`);
            } catch (_) {}
            state.stream = null;
        }
    }
};
