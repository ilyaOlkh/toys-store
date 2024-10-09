"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    addFavorite as apiAddFavorite,
    removeFavorite as apiRemoveFavorite,
} from "../utils/fetchFavorites";
import { RootState, AppDispatch } from "./store";
import { favorites } from "@prisma/client";

// Типы
interface NewFavorite {
    product_id: number;
}

interface LocalFavorite {
    product_id: number;
}

type FavoriteItem = favorites | LocalFavorite;

interface FavoritesState {
    favorites: FavoriteItem[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    nowPending: { productId: number; type: "remove" | "add" }[];
    queue: { productId: number; type: "remove" | "add" }[];
}

// Начальное состояние
const initialState: FavoritesState = {
    favorites: [],
    status: "idle",
    error: null,
    queue: [],
    nowPending: [],
};

// Вспомогательные функции
const getStoredFavorites = (): LocalFavorite[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem("favoritesToys");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const updateStoredFavorites = (favorites: LocalFavorite[]) => {
    localStorage.setItem("favoritesToys", JSON.stringify(favorites));
};

// Асинхронные действия
export const addFavorite = createAsyncThunk(
    "favorites/addFavorite",
    async (
        newFavorite: NewFavorite,
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            const state = getState() as RootState;
            const user = state.user.user;
            if (
                (state.favorites.nowPending.some(
                    (item) =>
                        item.productId === newFavorite.product_id &&
                        item.type === "add"
                ) &&
                    state.favorites.queue.some(
                        (item) =>
                            item.productId === newFavorite.product_id &&
                            item.type === "remove"
                    )) ||
                state.favorites.nowPending.some(
                    (item) =>
                        item.productId === newFavorite.product_id &&
                        item.type === "remove"
                )
            ) {
                dispatch(
                    addToQueue({
                        type: "add",
                        productId: newFavorite.product_id,
                    })
                );
                return rejectWithValue("add to queue");
            }

            if (!user) {
                const storedFavorites = getStoredFavorites();
                const isExist = storedFavorites.some(
                    (item) => item.product_id === newFavorite.product_id
                );

                if (!isExist) {
                    const localFavorite: LocalFavorite = {
                        product_id: newFavorite.product_id,
                    };
                    const updatedFavorites = [
                        ...storedFavorites,
                        localFavorite,
                    ];
                    updateStoredFavorites(updatedFavorites);

                    dispatch(addToFavorites(localFavorite)); // Dispatch to add to state
                    return { type: "local", data: localFavorite } as const;
                }
                return { type: "local", data: newFavorite } as const;
            } else {
                dispatch(
                    addToPending({
                        type: "add",
                        productId: newFavorite.product_id,
                    })
                );
                const dbFavorite = await apiAddFavorite(
                    user.sub,
                    newFavorite.product_id
                );
                dispatch(
                    clearPending({
                        productId: newFavorite.product_id,
                    })
                );
                dispatch(addToFavorites(dbFavorite)); // Dispatch to add to state
                if (
                    state.favorites.queue.some(
                        (item) =>
                            item.productId === newFavorite.product_id &&
                            item.type === "remove"
                    )
                ) {
                    dispatch(removeFavorite(newFavorite.product_id));
                }
                dispatch(clearQueue({ productId: newFavorite.product_id }));
                return { type: "db", data: dbFavorite } as const;
            }
        } catch (error) {
            console.log(error);
            return rejectWithValue("Не удалось добавить товар в избранное");
        }
    }
);

export const removeFavorite = createAsyncThunk(
    "favorites/removeFavorite",
    async (productId: number, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const user = state.user.user;

            if (
                (state.favorites.nowPending.some(
                    (item) =>
                        item.productId === productId && item.type === "remove"
                ) &&
                    state.favorites.queue.some(
                        (item) =>
                            item.productId === productId && item.type === "add"
                    )) ||
                state.favorites.nowPending.some(
                    (item) =>
                        item.productId === productId && item.type === "add"
                )
            ) {
                console.log(1);
                dispatch(
                    addToQueue({
                        type: "remove",
                        productId: productId,
                    })
                );
                return rejectWithValue("add to queue");
            }

            if (!user) {
                const storedFavorites = getStoredFavorites();
                const updatedFavorites = storedFavorites.filter(
                    (item) => item.product_id !== productId
                );
                updateStoredFavorites(updatedFavorites);

                dispatch(removeFromFavorites(productId)); // Dispatch to remove from state
                return { type: "local", productId } as const;
            } else {
                dispatch(
                    addToPending({
                        type: "remove",
                        productId: productId,
                    })
                );
                const favoriteItem = state.favorites.favorites.find(
                    (item) => item.product_id === productId
                );
                if (!favoriteItem || !("id" in favoriteItem)) {
                    throw new Error("Запись не найдена");
                }

                await apiRemoveFavorite(favoriteItem.id);
                dispatch(
                    clearPending({
                        productId: productId,
                    })
                );
                dispatch(removeFromFavorites(productId)); // Dispatch to remove from state
                if (
                    state.favorites.queue.some(
                        (item) =>
                            item.productId === productId && item.type === "add"
                    )
                ) {
                    dispatch(addFavorite({ product_id: productId }));
                }
                dispatch(clearQueue({ productId: productId }));
                return { type: "db", productId } as const;
            }
        } catch (error) {
            return rejectWithValue("Не удалось удалить товар из избранного");
        }
    }
);

// Селекторы остаются без изменений
export const selectFavorites = (state: RootState) => {
    if (state.user.user) {
        return state.favorites.favorites;
    }
    return getStoredFavorites();
};

export const selectFavoriteIds = (state: RootState) => {
    return state.favorites.favorites.map((item) => item.product_id);
};

// Слайс
const favoritesSlice = createSlice({
    name: "favorites",
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
            state.favorites = action.payload;
            state.status = "succeeded";
        },
        clearFavorites: (state) => {
            state.favorites = [];
            state.status = "idle";
            state.error = null;
            state.queue = [];
            state.nowPending = [];
            if (typeof window !== "undefined") {
                localStorage.removeItem("favoritesToys");
            }
        },
        syncWithLocalStorage: (state) => {
            const storedFavorites = getStoredFavorites();
            state.favorites = storedFavorites;
        },
        addToQueue: (
            state,
            action: PayloadAction<{ type: "add" | "remove"; productId: number }>
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
                        item.productId !== action.payload.productId;
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
                        item.productId !== action.payload.productId;
                    });
                } else {
                    state.queue.push(action.payload);
                }
            }
            console.log(state.queue);
        },
        clearQueue: (state, action: PayloadAction<{ productId: number }>) => {
            state.queue = state.queue.filter((item) => {
                item.productId !== action.payload.productId;
            });
        },
        addToPending: (
            state,
            action: PayloadAction<{ type: "add" | "remove"; productId: number }>
        ) => {
            state.nowPending.push(action.payload);
        },
        clearPending: (state, action: PayloadAction<{ productId: number }>) => {
            state.nowPending = state.nowPending.filter((item) => {
                item.productId !== action.payload.productId;
            });
        },
        addToFavorites: (state, action: PayloadAction<FavoriteItem>) => {
            if (
                !state.favorites.some(
                    (item) => item.product_id === action.payload.product_id
                )
            ) {
                state.favorites.push(action.payload);
            }
        },
        removeFromFavorites: (state, action: PayloadAction<number>) => {
            state.favorites = state.favorites.filter(
                (item) => item.product_id !== action.payload
            );
        },
    },
});

export const {
    setFavorites,
    clearFavorites,
    syncWithLocalStorage,
    addToQueue,
    addToFavorites,
    removeFromFavorites,
    addToPending,
    clearPending,
    clearQueue,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
