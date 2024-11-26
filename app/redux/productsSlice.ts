// app/redux/productsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ProductType } from "@/app/types/types";
import { ClientFilter, FilterValue } from "../types/filters";

interface ProductsState {
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
};

export const fetchFilteredProducts = createAsyncThunk(
    "products/fetchFilteredProducts",
    async (_, { getState }) => {
        const state = getState() as { products: ProductsState };

        const activeFilters = Object.entries(state.products.filterValues)
            .filter(([name, filter]) => {
                const config = state.products.filterConfigs.find(
                    (f) => f.name === name
                );
                return filter !== config?.defaultValue;
            })
            .map(([name, filter]) => ({
                name,
                value: filter,
            }));

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/filter`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filters: activeFilters,
                    sort: state.products.sort,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return response.json();
    }
);

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
        setFilter: (
            state,
            action: PayloadAction<{ name: string; value: FilterValue }>
        ) => {
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

export const { initializeProducts, setFilter, setSort, resetFilters } =
    productsSlice.actions;

export default productsSlice.reducer;
