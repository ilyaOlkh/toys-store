"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    addToCart as apiAddToCart,
    updateCartItemQuantity as apiUpdateCartItemQuantity,
    removeFromCart as apiRemoveFromCart,
    clearCart,
} from "../utils/fetchCart";
import { RootState } from "./store";
import { cart } from "@prisma/client";
import { ProductType } from "../types/types";
import { fetchProductsByIds } from "../utils/fetch";

// Типы
interface NewCartItem {
    product_id: number;
    quantity: number;
}
interface LocalCartItem {
    product_id: number;
    quantity: number;
}
export type CartItem = cart | LocalCartItem;
interface CartState {
    cart: CartItem[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    nowPending: {
        productId: number;
        type: "add" | "remove" | "update";
        quantity?: number;
    }[];
    queue: {
        productId: number;
        type: "add" | "remove" | "update";
        quantity?: number;
    }[];
    cartProducts: ProductType[];
    isInit: boolean;
}

// Начальное состояние
const initialState: CartState = {
    cart: [],
    status: "idle",
    error: null,
    queue: [],
    nowPending: [],
    cartProducts: [],
    isInit: false,
};

// Вспомогательные функции
const getStoredCart = (): LocalCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem("cartItems");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};
const updateStoredCart = (cart: LocalCartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
};

export const setCart = createAsyncThunk(
    "cart/setCart",
    async (
        {
            CartItems,
            CartProducts,
        }: {
            CartItems: CartItem[];
            CartProducts: ProductType[] | undefined;
        },
        { rejectWithValue, getState, dispatch }
    ) => {
        dispatch(setCartState(CartItems));
        if (CartProducts) {
            dispatch(setProductsState(CartProducts));
        } else {
            const ids = CartItems.map((item) => item.product_id);
            const cartProducts = await fetchProductsByIds(ids);

            dispatch(setProductsState(cartProducts));
        }
    }
);

// Асинхронные действия
export const addCartItem = createAsyncThunk(
    "cartItems/addCartItem",
    async (
        newCartItem: NewCartItem,
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            const user = (getState() as RootState).user.user;
            if (
                ((getState() as RootState).cart.nowPending.some(
                    (item) =>
                        item.productId === newCartItem.product_id &&
                        item.type === "add"
                ) &&
                    (getState() as RootState).cart.queue.some(
                        (item) =>
                            item.productId === newCartItem.product_id &&
                            item.type === "remove"
                    )) ||
                (getState() as RootState).cart.nowPending.some(
                    (item) =>
                        item.productId === newCartItem.product_id &&
                        item.type === "remove"
                )
            ) {
                dispatch(
                    addToQueue({
                        type: "add",
                        productId: newCartItem.product_id,
                        quantity: newCartItem.quantity,
                    })
                );
                return rejectWithValue("add to queue");
            }

            if (!user) {
                const storedCart = getStoredCart();
                const isExist = storedCart.some(
                    (item) => item.product_id === newCartItem.product_id
                );

                if (!isExist) {
                    const localCartItem: LocalCartItem = {
                        product_id: newCartItem.product_id,
                        quantity: newCartItem.quantity,
                    };
                    const updatedCart = [...storedCart, localCartItem];
                    updateStoredCart(updatedCart);

                    dispatch(addToCart(localCartItem));
                    dispatch(
                        addProductsState(
                            (
                                await fetchProductsByIds([
                                    localCartItem.product_id,
                                ])
                            )[0]
                        )
                    );
                    return { type: "local", data: localCartItem } as const;
                }
                return { type: "local", data: newCartItem } as const;
            } else {
                dispatch(
                    addToPending({
                        type: "add",
                        productId: newCartItem.product_id,
                        quantity: newCartItem.quantity,
                    })
                );
                const dbCartItem = await apiAddToCart(
                    user.sub,
                    newCartItem.product_id,
                    newCartItem.quantity
                );
                dispatch(
                    addToCart({
                        id: dbCartItem.id,
                        user_identifier: dbCartItem.user_identifier,
                        product_id: dbCartItem.product_id,
                        quantity: newCartItem.quantity,
                    })
                );
                dispatch(addProductsState(dbCartItem.product));

                dispatch(
                    clearPending({
                        productId: newCartItem.product_id,
                    })
                );

                if (
                    (getState() as RootState).cart.queue.some(
                        (item) =>
                            item.productId === newCartItem.product_id &&
                            item.type === "remove"
                    )
                ) {
                    dispatch(removeCartItem(newCartItem.product_id));
                }
                dispatch(clearQueue({ productId: newCartItem.product_id }));
                return { type: "db", data: dbCartItem } as const;
            }
        } catch (error) {
            return rejectWithValue("Не удалось добавить товар в избранное");
        }
    }
);

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async (
        { productId, quantity }: { productId: number; quantity: number },
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            const user = (getState() as RootState).user.user;

            // Проверяем, есть ли конфликтующие операции в обработке
            if (
                (getState() as RootState).cart.nowPending.some(
                    (item) =>
                        (item.productId === productId &&
                            item.type === "update") ||
                        item.type === "add" ||
                        item.type === "remove"
                )
            ) {
                dispatch(
                    addToQueue({
                        type: "update",
                        productId: productId,
                        quantity: quantity,
                    })
                );
                return rejectWithValue("add to queue");
            }

            if (!user) {
                // Локальная корзина (без авторизации)
                const storedCart = getStoredCart();
                const updatedCart = storedCart.map((item) =>
                    item.product_id === productId ? { ...item, quantity } : item
                );
                updateStoredCart(updatedCart);
                dispatch(updateCartQuantity({ productId, quantity }));
                return { type: "local", productId, quantity } as const;
            } else {
                // Авторизованная корзина
                dispatch(
                    addToPending({
                        type: "update",
                        productId: productId,
                        quantity: quantity,
                    })
                );

                const cartItem = (getState() as RootState).cart.cart.find(
                    (item) => item.product_id === productId
                );

                if (!cartItem || !("id" in cartItem)) {
                    throw new Error("Товар не найден в корзине");
                }

                const updatedItem = await apiUpdateCartItemQuantity(
                    cartItem.id,
                    quantity
                );

                dispatch(updateCartQuantity({ productId, quantity }));

                dispatch(
                    clearPending({
                        productId: productId,
                    })
                );

                // Проверяем очередь на наличие следующих операций
                const state = getState() as RootState;
                const nextQueueItem = state.cart.queue.find(
                    (item) => item.productId === productId
                );

                if (nextQueueItem) {
                    if (nextQueueItem.type === "add") {
                        dispatch(
                            addCartItem({
                                product_id: productId,
                                quantity: nextQueueItem.quantity || 1,
                            })
                        );
                    } else if (nextQueueItem.type === "remove") {
                        dispatch(removeCartItem(productId));
                    } else if (
                        nextQueueItem.type === "update" &&
                        nextQueueItem.quantity
                    ) {
                        dispatch(
                            updateCartItem({
                                productId,
                                quantity: nextQueueItem.quantity,
                            })
                        );
                    }
                }

                dispatch(clearQueue({ productId: productId }));
                return { type: "db", productId, quantity } as const;
            }
        } catch (error) {
            return rejectWithValue(
                "Не удалось обновить количество товара в корзине"
            );
        }
    }
);

export const removeCartItem = createAsyncThunk(
    "cart/removeCartItem",
    async (productId: number, { rejectWithValue, getState, dispatch }) => {
        try {
            const user = (getState() as RootState).user.user;

            if (
                ((getState() as RootState).cart.nowPending.some(
                    (item) =>
                        item.productId === productId && item.type === "remove"
                ) &&
                    (getState() as RootState).cart.queue.some(
                        (item) =>
                            item.productId === productId && item.type === "add"
                    )) ||
                (getState() as RootState).cart.nowPending.some(
                    (item) =>
                        item.productId === productId && item.type === "add"
                )
            ) {
                dispatch(
                    addToQueue({
                        type: "remove",
                        productId: productId,
                    })
                );
                return rejectWithValue("add to queue");
            }

            if (!user) {
                const storedCart = getStoredCart();
                const updatedCart = storedCart.filter(
                    (item) => item.product_id !== productId
                );
                updateStoredCart(updatedCart);

                dispatch(removeFromCart(productId));
                return { type: "local", productId } as const;
            } else {
                dispatch(
                    addToPending({
                        type: "remove",
                        productId: productId,
                    })
                );

                dispatch(clearQueue({ productId: productId }));

                const cartItem = (getState() as RootState).cart.cart.find(
                    (item) => item.product_id === productId
                );
                if (!cartItem || !("id" in cartItem)) {
                    throw new Error("Запись не найдена");
                }

                await apiRemoveFromCart(cartItem.id);
                dispatch(removeFromCart(productId)); // Dispatch to remove from state
                dispatch(
                    clearPending({
                        productId: productId,
                    })
                );

                const nextQueueItem = (getState() as RootState).cart.queue.find(
                    (item) =>
                        item.productId === productId && item.type === "add"
                );

                if (nextQueueItem) {
                    dispatch(
                        addCartItem({
                            product_id: productId,
                            quantity: nextQueueItem.quantity || 1,
                        })
                    );
                }
                dispatch(clearQueue({ productId: productId }));
                return { type: "db", productId } as const;
            }
        } catch (error) {
            return rejectWithValue("Не удалось удалить товар из избранного");
        }
    }
);

export const clearCartThunk = createAsyncThunk(
    "cart/clearCart",
    async (_, { getState, dispatch }) => {
        try {
            const user = (getState() as RootState).user.user;

            if (user) {
                await clearCart(user.sub);
            }

            dispatch(clearCartState());

            return true;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }
);

// Слайс
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartState: (state, action: PayloadAction<CartItem[]>) => {
            state.cart = action.payload;
            state.status = "succeeded";
        },
        setProductsState: (state, action: PayloadAction<ProductType[]>) => {
            state.isInit = true;
            state.cartProducts = action.payload;
            state.status = "succeeded";
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.cart.find(
                (item) => item.product_id === action.payload.product_id
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.cart.push(action.payload);
            }
        },
        updateCartQuantity: (
            state,
            action: PayloadAction<{ productId: number; quantity: number }>
        ) => {
            const item = state.cart.find(
                (item) => item.product_id === action.payload.productId
            );
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            state.cart = state.cart.filter(
                (item) => item.product_id !== action.payload
            );
        },
        addToPending: (
            state,
            action: PayloadAction<{
                type: "add" | "remove" | "update";
                productId: number;
                quantity?: number;
            }>
        ) => {
            state.nowPending.push(action.payload);
        },
        addToQueue: (
            state,
            action: PayloadAction<{
                type: "add" | "remove" | "update";
                productId: number;
                quantity?: number;
            }>
        ) => {
            if (action.payload.type === "add") {
                if (
                    state.queue.some(
                        (item) =>
                            item.productId === action.payload.productId &&
                            item.type === "remove"
                    )
                ) {
                    state.queue = state.queue.filter((item) => {
                        return item.productId !== action.payload.productId;
                    });
                } else {
                    state.queue.push(action.payload);
                }
            } else if (action.payload.type === "remove") {
                if (
                    state.queue.some(
                        (item) =>
                            item.productId === action.payload.productId &&
                            item.type === "add"
                    )
                ) {
                    state.queue = state.queue.filter((item) => {
                        return item.productId !== action.payload.productId;
                    });
                } else {
                    state.queue.push(action.payload);
                }
            } else if (action.payload.type === "update") {
                state.queue = state.queue.filter((item) => {
                    return (
                        item.productId !== action.payload.productId ||
                        item.type !== "update"
                    );
                });

                state.queue.push(action.payload);
            }
        },
        clearPending: (state, action: PayloadAction<{ productId: number }>) => {
            state.nowPending = state.nowPending.filter(
                (item) => item.productId !== action.payload.productId
            );
        },
        clearQueue: (state, action: PayloadAction<{ productId: number }>) => {
            state.queue = state.queue.filter((item) => {
                return item.productId !== action.payload.productId;
            });
        },
        addProductsState: (state, action: PayloadAction<ProductType>) => {
            state.cartProducts = [...state.cartProducts, action.payload];
            state.status = "succeeded";
        },
        clearCartState: (state) => {
            state.cart = [];
            state.queue = [];
            state.nowPending = [];
            state.cartProducts = [];
            state.status = "idle";
            state.error = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("cartItems");
            }
        },
    },
});

export const {
    setCartState,
    setProductsState,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    addToPending,
    addToQueue,
    clearPending,
    clearQueue,
    addProductsState,
    clearCartState,
} = cartSlice.actions;
export default cartSlice.reducer;
