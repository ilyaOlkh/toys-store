"use client";

import { configureStore } from "@reduxjs/toolkit";
import { createContext, useContext, useRef, useSyncExternalStore } from "react";
import productsReducer, {
    initializeProducts,
    ProductsState,
} from "../redux/productsSlice";
import { ProductType } from "../types/types";
import { ClientFilter } from "../types/filters";

const makeProductsStore = () => {
    return configureStore({
        reducer: {
            products: productsReducer,
        },
    });
};

type ProductsStore = ReturnType<typeof makeProductsStore>;

const ProductsStoreContext = createContext<ProductsStore | null>(null);

interface ProductsStoreProviderProps {
    children: React.ReactNode;
    initialProducts: ProductType[];
    filters: ClientFilter[];
}

export function ProductsStoreProvider({
    children,
    initialProducts,
    filters,
}: ProductsStoreProviderProps) {
    const storeRef = useRef<ProductsStore>();

    if (!storeRef.current) {
        storeRef.current = makeProductsStore();
        storeRef.current.dispatch(
            initializeProducts({
                products: initialProducts,
                filters: filters,
            })
        );
    }

    return (
        <ProductsStoreContext.Provider value={storeRef.current}>
            {children}
        </ProductsStoreContext.Provider>
    );
}

// Кастомные хуки для работы с состоянием
export function useProductsSelector<Selected>(
    selector: (state: { products: ProductsState }) => Selected
) {
    const store = useContext(ProductsStoreContext);
    if (!store) {
        throw new Error(
            "useProductsSelector must be used within ProductsStoreProvider"
        );
    }

    // Используем useSyncExternalStore для подписки на изменения store
    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState())
    );
}

export function useProductsDispatch() {
    const store = useContext(ProductsStoreContext);
    if (!store) {
        throw new Error(
            "useProductsDispatch must be used within ProductsStoreProvider"
        );
    }

    return store.dispatch;
}

export function useProducts() {
    const productsState = useProductsSelector((state) => state.products);
    const dispatch = useProductsDispatch();

    return {
        ...productsState,
        dispatch,
    };
}
