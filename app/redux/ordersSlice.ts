import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { order_products, orders } from "@prisma/client";
import { FilterValue, SortDirection, ClientFilter } from "../types/filters";
import { OrdersDispatch } from "../components/OrdersContext";
import { ClientSortConfig } from "../service/filters";

const updateSearchParams = (
    filterValues: { [key: string]: FilterValue },
    sort: OrderSortState,
    sortingRuleSet: string,
    pagination?: { limit?: number; offset?: number }
) => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);

    if (Object.keys(filterValues).length > 0) {
        searchParams.set("filters", JSON.stringify(filterValues));
    } else {
        searchParams.delete("filters");
    }

    if (Object.keys(sort).length > 0) {
        searchParams.set("sort", JSON.stringify(sort));
        searchParams.set("sortingRuleSet", sortingRuleSet);
    } else {
        searchParams.delete("sort");
        searchParams.delete("sortingRuleSet");
    }

    if (pagination?.limit) {
        searchParams.set("limit", pagination.limit.toString());
    }
    if (pagination?.offset !== undefined) {
        searchParams.set("offset", pagination.offset.toString());
    }

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
};

interface FilterChange {
    name: string;
    value: FilterValue;
}

export interface OrderSortState {
    field: string;
    direction: SortDirection;
}

export type OrderType = orders & {
    products: (order_products & { images: string[] })[];
};

export interface OrdersStateType {
    orders: OrderType[];
    filterValues: {
        [key: string]: FilterValue;
    };
    filterConfigs: ClientFilter[];
    sortConfig: ClientSortConfig | null;
    sortingRuleSet: string;
    sort: OrderSortState;
    pagination: {
        limit?: number;
        offset?: number;
    };
    total: number;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
    nowPending: boolean;
    queue: boolean;
}

const initialState: OrdersStateType = {
    orders: [],
    filterValues: {},
    filterConfigs: [],
    sortConfig: null,
    sortingRuleSet: "",
    sort: {
        field: "default",
        direction: "asc",
    },
    pagination: {},
    total: 0,
    loading: false,
    error: null,
    isInitialized: false,
    nowPending: false,
    queue: false,
};

export const fetchFilteredOrders = createAsyncThunk<
    { orders: OrderType[]; total: number },
    void,
    { state: { orders: OrdersStateType } }
>("orders/fetchFiltered", async (_, { dispatch, getState }) => {
    let state = getState().orders;
    const { filterValues, sort, sortingRuleSet, pagination } = state;

    if (state.nowPending) {
        dispatch(setQueue(true));
        return {
            orders: state.orders,
            total: state.total,
        };
    }

    dispatch(setPending(true));

    const params = new URLSearchParams();
    if (Object.keys(filterValues).length > 0) {
        params.append("filters", JSON.stringify(filterValues));
    }

    if (Object.keys(sort).length > 0) {
        params.append("sort", JSON.stringify(sort));
        params.append("sortingRuleSet", JSON.stringify(sortingRuleSet));
    }

    if (pagination.limit !== undefined) {
        params.append("limit", pagination.limit.toString());
    }
    if (pagination.offset !== undefined) {
        params.append("offset", pagination.offset.toString());
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/orders/filtered?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            next: {
                revalidate: Number(process.env.NEXT_PUBLIC_REVALIDATE) || 60,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    dispatch(clearPending());

    state = getState().orders;
    if (state.queue) {
        dispatch(clearQueue());
        dispatch(fetchFilteredOrders());
    }

    return {
        orders: data.orders,
        total: data.total,
    };
});

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        initializeOrders: (
            state,
            action: PayloadAction<{
                orders: OrderType[];
                filters: ClientFilter[];
                sortConfig: ClientSortConfig;
                sortingRuleSet: string;
                filterValues: Record<string, FilterValue>;
                sort: OrderSortState;
                total: number;
                pagination?: {
                    limit?: number;
                    offset?: number;
                };
            }>
        ) => {
            state.orders = action.payload.orders;
            state.filterConfigs = action.payload.filters;
            state.sortConfig = action.payload.sortConfig;
            state.sortingRuleSet = action.payload.sortingRuleSet;
            state.filterValues = action.payload.filterValues;
            state.sort = action.payload.sort;
            state.total = action.payload.total;
            if (action.payload.pagination) {
                state.pagination = action.payload.pagination;
            }
            state.isInitialized = true;
        },
        setPagination: (
            state,
            action: PayloadAction<{
                limit?: number;
                offset?: number;
            }>
        ) => {
            state.pagination = {
                ...state.pagination,
                ...action.payload,
            };
            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet,
                state.pagination
            );
        },
        setFilter: (state, action: PayloadAction<FilterChange>) => {
            const { name, value } = action.payload;
            const filterConfig = state.filterConfigs.find(
                (f) => f.name === name
            );

            if (!filterConfig) return;

            if (value === null || value === undefined) {
                state.filterValues[name] = filterConfig.defaultValue;
            } else {
                state.filterValues[name] = value;
            }

            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet,
                state.pagination
            );
        },
        setSort: (
            state,
            action: PayloadAction<{
                field: string;
                direction?: SortDirection;
            }>
        ) => {
            const { field, direction } = action.payload;
            state.sort = {
                field,
                direction: direction ?? state.sort.direction,
            };

            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet
            );
        },
        toggleSortDirection: (state) => {
            state.sort.direction =
                state.sort.direction === "asc" ? "desc" : "asc";

            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet
            );
        },
        resetSort: (state) => {
            const defaultConfig = state.sortConfig;
            state.sort = {
                field: defaultConfig ? defaultConfig.defaultOption : "default",
                direction: defaultConfig
                    ? defaultConfig.defaultDirection
                    : "asc",
            };

            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet
            );
        },
        resetFilters: (state) => {
            state.filterValues = state.filterConfigs.reduce(
                (acc, filter) => ({
                    ...acc,
                    [filter.name]: filter.defaultValue,
                }),
                {}
            );
            state.queue = false;
            state.nowPending = false;

            updateSearchParams(
                state.filterValues,
                state.sort,
                state.sortingRuleSet
            );
        },
        setPending: (state, action: PayloadAction<boolean>) => {
            state.nowPending = action.payload;
        },
        clearPending: (state) => {
            state.nowPending = false;
        },
        setQueue: (state, action: PayloadAction<boolean>) => {
            state.queue = action.payload;
        },
        clearQueue: (state) => {
            state.queue = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilteredOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFilteredOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.total = action.payload.total;
            })
            .addCase(fetchFilteredOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch orders";
            });
    },
});

export const setPaginationAndFetch =
    (pagination: { limit?: number; offset?: number }) =>
    async (dispatch: OrdersDispatch) => {
        dispatch(setPagination(pagination));
        dispatch(fetchFilteredOrders());
    };

export const filterOrders =
    (filterChange: FilterChange) => async (dispatch: OrdersDispatch) => {
        dispatch(setFilter(filterChange));
        dispatch(fetchFilteredOrders());
        dispatch(
            setPaginationAndFetch({
                limit: Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE),
                offset: 0,
            })
        );
    };

export const sortOrders =
    (sortConfig: { field: string; direction?: SortDirection }) =>
    async (dispatch: OrdersDispatch) => {
        dispatch(setSort(sortConfig));
        dispatch(fetchFilteredOrders());
    };

export const toggleSort = () => async (dispatch: OrdersDispatch) => {
    dispatch(toggleSortDirection());
    dispatch(fetchFilteredOrders());
};

export const {
    initializeOrders,
    setFilter,
    setSort,
    toggleSortDirection,
    resetSort,
    resetFilters,
    setPending,
    clearPending,
    setQueue,
    clearQueue,
    setPagination,
} = ordersSlice.actions;

export default ordersSlice.reducer;
