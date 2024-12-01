// app/redux/productsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ProductType } from "@/app/types/types";
import { ClientFilter, FilterValue } from "../types/filters";

interface FilterChange {
    name: string;
    value: FilterValue;
}

export interface ProductsState {
    products: ProductType[];
    filterValues: {
        [key: string]: FilterValue;
    };
    filterConfigs: ClientFilter[];
    sort: {
        field: string;
        direction: "asc" | "desc";
    };
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
    nowPending: FilterChange | null;
    queue: FilterChange | null;
}

const initialState: ProductsState = {
    products: [],
    filterValues: {},
    filterConfigs: [],
    sort: {
        field: "default",
        direction: "asc",
    },
    loading: false,
    error: null,
    isInitialized: false,
    nowPending: null,
    queue: null,
};

export const fetchFilteredProducts = createAsyncThunk<
    ProductType[],
    void,
    { state: { products: ProductsState } }
>("products/fetchFiltered", async (_, { getState }) => {
    const state = getState();
    const { filterValues } = state.products;

    // Преобразуем фильтры в query параметры
    const params = new URLSearchParams();
    if (Object.keys(filterValues).length > 0) {
        params.append("filters", JSON.stringify(filterValues));
    }

    // Выполняем запрос
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
    return data.products;
});

export const setFilter = createAsyncThunk<
    void,
    FilterChange,
    { state: { products: ProductsState } }
>("products/setFilter", async ({ name, value }, { dispatch, getState }) => {
    let state = getState().products;

    dispatch(setFilterState({ name, value }));

    if (state.nowPending) {
        dispatch(setQueue({ name, value }));
        return;
    }

    dispatch(setPending({ name, value }));

    try {
        await dispatch(fetchFilteredProducts());
    } finally {
        dispatch(clearPending());

        state = getState().products;
        const nextInQueue = state.queue;
        if (nextInQueue) {
            dispatch(setFilter(nextInQueue));
            dispatch(clearQueue());
        }
    }
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
            }>
        ) => {
            // Инициализируем продукты и создаем начальное состояние фильтров
            state.products = action.payload.products;
            state.filterConfigs = action.payload.filters;

            // Создаем состояние фильтров из полученной конфигурации
            state.filterValues = action.payload.filters.reduce(
                (acc, filter) => ({
                    ...acc,
                    [filter.name]: filter.defaultValue,
                }),
                {}
            );
            state.isInitialized = true;
        },
        setFilterState: (state, action: PayloadAction<FilterChange>) => {
            const { name, value } = action.payload;
            const filterConfig = state.filterConfigs.find(
                (f) => f.name === name
            );

            if (!filterConfig) return;

            if (value === null || value === undefined) {
                // Если значение null/undefined - возвращаем к дефолтному значению
                state.filterValues[name] = filterConfig.defaultValue;
            } else {
                // Просто устанавливаем новое значение
                state.filterValues[name] = value;
            }
        },
        setPending: (state, action: PayloadAction<FilterChange>) => {
            state.nowPending = action.payload;
        },
        clearPending: (state) => {
            state.nowPending = null;
        },
        setQueue: (state, action: PayloadAction<FilterChange>) => {
            state.queue = action.payload;
        },
        clearQueue: (state) => {
            state.queue = null;
        },
        setSort: (state, action: PayloadAction<ProductsState["sort"]>) => {
            state.sort = action.payload;
        },
        resetFilters: (state) => {
            // Сбрасываем к начальным значениям из конфигурации
            state.filterValues = state.filterConfigs.reduce(
                (acc, filter) => ({
                    ...acc,
                    [filter.name]: filter.defaultValue,
                }),
                {}
            );
            state.queue = null;
            state.nowPending = null;
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

export const {
    initializeProducts,
    setFilterState,
    setSort,
    resetFilters,
    setPending,
    clearPending,
    setQueue,
    clearQueue,
} = productsSlice.actions;

export default productsSlice.reducer;
