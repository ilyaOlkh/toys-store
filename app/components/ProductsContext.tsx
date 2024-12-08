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
import { ClientSortConfig } from "../service/filters";

const makeProductsStore = (
    initialProducts: ProductType[],
    filters: ClientFilter[],
    sortConfig: ClientSortConfig,
    sortingRuleSet: string,
    initialFilterValues: Record<string, FilterValue>,
    initialSort: {
        field: string;
        direction: SortDirection;
    },
    limit?: number,
    offset?: number
) => {
    const store = configureStore({
        reducer: {
            products: productsReducer,
        },
    });

    store.dispatch(
        initializeProducts({
            products: initialProducts,
            filters: filters,
            sortConfig: sortConfig,
            sortingRuleSet: sortingRuleSet,
            filterValues: initialFilterValues,
            sort: initialSort,
            pagination: {
                limit,
                offset,
            },
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
    sortConfig: ClientSortConfig;
    sortingRuleSet: string;
    initialFilterValues: Record<string, FilterValue>;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
    limit?: number;
    offset?: number;
}

export function ProductsStoreProvider({
    children,
    initialProducts,
    filters,
    sortConfig,
    sortingRuleSet,
    initialFilterValues,
    initialSort,
    limit,
    offset,
}: ProductsStoreProviderProps) {
    const storeRef = useRef<ProductsStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeProductsStore(
            initialProducts,
            filters,
            sortConfig,
            sortingRuleSet,
            initialFilterValues,
            initialSort,
            limit,
            offset
        );
    }

    return (
        <ProductsStoreContext.Provider value={storeRef.current}>
            {children}
        </ProductsStoreContext.Provider>
    );
}

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
