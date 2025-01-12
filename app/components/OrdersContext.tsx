"use client";

import { configureStore } from "@reduxjs/toolkit";
import { createContext, useContext, useRef, useSyncExternalStore } from "react";
import ordersReducer, {
    initializeOrders,
    OrdersStateType,
    OrderType,
} from "../redux/ordersSlice";
import { ClientFilter, FilterValue, SortDirection } from "../types/filters";
import { ClientSortConfig } from "../service/filters";

const makeOrdersStore = (
    initialOrders: OrderType[],
    filters: ClientFilter[],
    sortConfig: ClientSortConfig,
    sortingRuleSet: string,
    initialFilterValues: Record<string, FilterValue>,
    initialSort: {
        field: string;
        direction: SortDirection;
    },
    total: number,
    limit?: number,
    offset?: number
) => {
    const store = configureStore({
        reducer: {
            orders: ordersReducer,
        },
    });

    store.dispatch(
        initializeOrders({
            orders: initialOrders,
            filters: filters,
            sortConfig: sortConfig,
            sortingRuleSet: sortingRuleSet,
            filterValues: initialFilterValues,
            sort: initialSort,
            total,
            pagination: {
                limit,
                offset,
            },
        })
    );

    return store;
};

export type OrdersStore = ReturnType<typeof makeOrdersStore>;
export type OrdersState = ReturnType<OrdersStore["getState"]>;
export type OrdersDispatch = OrdersStore["dispatch"];

const OrdersStoreContext = createContext<OrdersStore | null>(null);

interface OrdersStoreProviderProps {
    children: React.ReactNode;
    initialOrders: OrderType[];
    filters: ClientFilter[];
    sortConfig: ClientSortConfig;
    sortingRuleSet: string;
    initialFilterValues: Record<string, FilterValue>;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
    total?: number;
    limit?: number;
    offset?: number;
}

export function OrdersStoreProvider({
    children,
    initialOrders,
    filters,
    sortConfig,
    sortingRuleSet,
    initialFilterValues,
    initialSort,
    total,
    limit,
    offset,
}: OrdersStoreProviderProps) {
    const storeRef = useRef<OrdersStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeOrdersStore(
            initialOrders,
            filters,
            sortConfig,
            sortingRuleSet,
            initialFilterValues,
            initialSort,
            total ?? 0,
            limit,
            offset
        );
    }

    return (
        <OrdersStoreContext.Provider value={storeRef.current}>
            {children}
        </OrdersStoreContext.Provider>
    );
}

export function useOrdersSelector<Selected>(
    selector: (state: OrdersStateType) => Selected
) {
    const store = useContext(OrdersStoreContext);
    if (!store) {
        throw new Error(
            "useOrdersSelector must be used within OrdersStoreProvider"
        );
    }

    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState().orders),
        () => selector(store.getState().orders)
    );
}

export function useOrdersDispatch() {
    const store = useContext(OrdersStoreContext);
    if (!store) {
        throw new Error(
            "useOrdersDispatch must be used within OrdersStoreProvider"
        );
    }

    return store.dispatch;
}

export function useOrders() {
    const ordersState = useOrdersSelector((state) => state);
    const dispatch = useOrdersDispatch();

    return {
        ...ordersState,
        dispatch,
    };
}
