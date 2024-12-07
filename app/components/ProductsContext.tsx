"use client";

import { configureStore } from "@reduxjs/toolkit";
import { createContext, useContext, useRef, useSyncExternalStore } from "react";
import productsReducer, {
    initializeProducts,
    ProductsStateType,
} from "../redux/productsSlice";
import { ProductType } from "../types/types";
import {
    ClientFilter,
    SortConfig,
    FilterValue,
    SortDirection,
} from "../types/filters";

const makeProductsStore = (
    initialProducts: ProductType[],
    filters: ClientFilter[],
    sortConfig: SortConfig,
    sortingRuleSet: string,
    initialFilterValues: Record<string, FilterValue>,
    initialSort: {
        field: string;
        direction: SortDirection;
    }
) => {
    const store = configureStore({
        reducer: {
            products: productsReducer,
        },
    });

    // Инициализируем store сразу после создания
    store.dispatch(
        initializeProducts({
            products: initialProducts,
            filters: filters,
            sortConfig: sortConfig,
            sortingRuleSet: sortingRuleSet,
            filterValues: initialFilterValues,
            sort: initialSort,
        })
    );

    return store;
};

export type ProductsStore = ReturnType<typeof makeProductsStore>;
export type ProductsState = ReturnType<ProductsStore["getState"]>;
export type ProductsDispatch = ProductsStore["dispatch"];

const ProductsStoreContext = createContext<ProductsStore | null>(null);

interface ProductsStoreProviderProps {
    children: React.ReactNode;
    initialProducts: ProductType[];
    filters: ClientFilter[];
    sortConfig: SortConfig;
    sortingRuleSet: string;
    initialFilterValues: Record<string, FilterValue>;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
}

export function ProductsStoreProvider({
    children,
    initialProducts,
    filters,
    sortConfig,
    sortingRuleSet,
    initialFilterValues,
    initialSort,
}: ProductsStoreProviderProps) {
    const storeRef = useRef<ProductsStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeProductsStore(
            initialProducts,
            filters,
            sortConfig,
            sortingRuleSet,
            initialFilterValues,
            initialSort
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
    selector: (state: ProductsStateType) => Selected
) {
    const store = useContext(ProductsStoreContext);
    if (!store) {
        throw new Error(
            "useProductsSelector must be used within ProductsStoreProvider"
        );
    }

    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState().products),
        () => selector(store.getState().products)
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
    const productsState = useProductsSelector((state) => state);
    const dispatch = useProductsDispatch();

    return {
        ...productsState,
        dispatch,
    };
}
