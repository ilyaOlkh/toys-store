import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ProductType } from "@/app/types/types";
import {
    ClientFilter,
    FilterValue,
    SortConfig,
    SortDirection,
} from "../types/filters";
import { ProductsDispatch } from "../components/ProductsContext";
import { ClientSortConfig } from "../service/filters";

const updateSearchParams = (
    filterValues: { [key: string]: FilterValue },
    sort: SortState,
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

export interface SortState {
    field: string;
    direction: SortDirection;
}

export interface ProductsStateType {
    products: ProductType[];
    filterValues: {
        [key: string]: FilterValue;
    };
    filterConfigs: ClientFilter[];
    sortConfig: ClientSortConfig | null;
    sortingRuleSet: string;
    sort: SortState;
    pagination: {
        limit?: number;
        offset?: number;
    };
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
    nowPending: boolean;
    queue: boolean;
}

const initialState: ProductsStateType = {
    products: [],
    filterValues: {},
    filterConfigs: [],
    sortConfig: null,
    sortingRuleSet: "",
    sort: {
        field: "default",
        direction: "asc",
    },
    pagination: {},
    loading: false,
    error: null,
    isInitialized: false,
    nowPending: false,
    queue: false,
};

export const fetchFilteredProducts = createAsyncThunk<
    ProductType[],
    void,
    { state: { products: ProductsStateType } }
>("products/fetchFiltered", async (_, { dispatch, getState }) => {
    let state = getState().products;
    const { filterValues, sort, sortingRuleSet, pagination } = state;

    if (state.nowPending) {
        dispatch(setQueue(true));
        return state.products;
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
        `${
            process.env.NEXT_PUBLIC_URL
        }/api/products/filtered?${params.toString()}`,
        {
            method: "GET",
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

    state = getState().products;
    if (state.queue) {
        dispatch(clearQueue());
        dispatch(fetchFilteredProducts());
    }

    return data.products;
});

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        initializeProducts: (
            state,
            action: PayloadAction<{
                products: ProductType[];
                filters: ClientFilter[];
                sortConfig: ClientSortConfig;
                sortingRuleSet: string;
                filterValues: Record<string, FilterValue>;
                sort: SortState;
                pagination?: {
                    limit?: number;
                    offset?: number;
                };
            }>
        ) => {
            state.products = action.payload.products;
            state.filterConfigs = action.payload.filters;
            state.sortConfig = action.payload.sortConfig;
            state.sortingRuleSet = action.payload.sortingRuleSet;
            state.filterValues = action.payload.filterValues;
            state.sort = action.payload.sort;
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
            .addCase(fetchFilteredProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchFilteredProducts.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch products";
            });
    },
});

export const setPaginationAndFetch =
    (pagination: { limit?: number; offset?: number }) =>
    async (dispatch: ProductsDispatch) => {
        dispatch(setPagination(pagination));
        dispatch(fetchFilteredProducts());
    };

export const filterProducts =
    (filterChange: FilterChange) => async (dispatch: ProductsDispatch) => {
        dispatch(setFilter(filterChange));
        dispatch(fetchFilteredProducts());
    };

export const sortProducts =
    (sortConfig: { field: string; direction?: SortDirection }) =>
    async (dispatch: ProductsDispatch) => {
        dispatch(setSort(sortConfig));
        dispatch(fetchFilteredProducts());
    };

export const toggleSort = () => async (dispatch: ProductsDispatch) => {
    dispatch(toggleSortDirection());
    dispatch(fetchFilteredProducts());
};

export const {
    initializeProducts,
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
} = productsSlice.actions;

export default productsSlice.reducer;
