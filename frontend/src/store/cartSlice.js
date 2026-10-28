import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        // Maps productId -> { name, hex } for selected color per cart item
        colorSelections: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const prodId = product._id || product.id;
            const existing = state.items.find(item => (item._id || item.id) === prodId);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
            } else {
                state.items.push({
                    ...product,
                    quantity: product.quantity || 1,
                });
            }
        },
        removeFromCart: (state, action) => {
            const prodId = action.payload;
            state.items = state.items.filter(item => (item._id || item.id) !== prodId);
            delete state.colorSelections[prodId];
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find(i => (i._id || i.id) === productId);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        },
        setCartItems: (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : [];
        },
        setColorSelection: (state, action) => {
            const { productId, color } = action.payload;
            state.colorSelections[productId] = color;
        },
        clearColorSelections: (state) => {
            state.colorSelections = {};
        },
        clearCart: (state) => {
            state.items = [];
            state.colorSelections = {};
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    setCartItems,
    setColorSelection,
    clearColorSelections,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
