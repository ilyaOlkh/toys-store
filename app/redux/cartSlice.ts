// cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
    addToCart as apiAddToCart,
    removeFromCart as apiRemoveFromCart,
} from "../utils/fetchCart";

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        // Устанавливаем начальные товары в корзине
        setCartItems: (state, action) => {
            state.items = action.payload;
        },
        // Добавляем товар в корзину
        addToCart: (state, action) => {
            const newItem: CartItem = action.payload;
            const existingItem = state.items.find(
                (item) => item.product_id === newItem.product_id
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                state.items.push(newItem);
            }
        },
        // Удаляем товар из корзины
        removeFromCart: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(
                (item) => item.product_id !== productId
            );
        },
    },
});

export const { setCartItems, addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
