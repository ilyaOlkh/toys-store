"use client";

import React from "react";
import { ProductType } from "@/app/types/types";
import { ProductCard } from "@/app/components/productCard";
import { ProductsStoreProvider, useProducts } from "../ProductsContext";
import {
    ClientFilter,
    FilterValue,
    SortConfig,
    SortDirection,
} from "@/app/types/filters";
import { FiltersList } from "./FiltersList";
import { filterProducts, sortProducts } from "@/app/redux/productsSlice";
import SortControl from "./SortSelect";
import { ClientSortConfig } from "@/app/service/filters";
import { Button } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import MobileFilters from "../modals/MobileFilters";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import { openModal } from "@/app/redux/modalSlice";
import { modalTypes } from "@/app/constants/modal-constants";

interface ProductsListScreenProps {
    initialProducts: ProductType[];
    initialFilters: ClientFilter[];
    initialSortConfig: ClientSortConfig;
    initialSortingRuleSet: string;
    initialFilterValues: Record<string, FilterValue>;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
    disableFilters?: boolean;
    disablePagination?: boolean;
    limit?: number;
    offset?: number;
}

export default function ProductsListScreen({
    initialProducts,
    initialFilters,
    initialSortConfig,
    initialSortingRuleSet,
    initialFilterValues,
    initialSort,
    disableFilters = false,
    disablePagination = false,
    limit,
    offset,
}: ProductsListScreenProps) {
    return (
        <ProductsStoreProvider
            initialProducts={initialProducts}
            filters={initialFilters}
            sortConfig={initialSortConfig}
            sortingRuleSet={initialSortingRuleSet}
            initialFilterValues={initialFilterValues}
            initialSort={initialSort}
            limit={limit}
            offset={offset}
        >
            <ProductsContent />
        </ProductsStoreProvider>
    );
}

interface ProductsContentProps {
    productsOnly?: boolean;
}

export function ProductsContent({
    productsOnly = false,
}: ProductsContentProps) {
    const appDispatch = useAppDispatch();

    const {
        products,
        filterValues,
        filterConfigs,
        sort,
        sortConfig,
        loading,
        error,
        isInitialized,
        dispatch,
    } = useProducts();

    return (
        <div className="flex justify-center">
            <div className="customContainer py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    {!productsOnly && (
                        <div className="hidden md:block w-[240px] flex-shrink-0 max-h-full overflow-auto">
                            <div className="flex flex-col gap-6">
                                {/* Filters */}
                                <FiltersList
                                    filterConfigs={filterConfigs}
                                    filterValues={filterValues}
                                    onFilterChange={(name, value) => {
                                        dispatch(
                                            filterProducts({ name, value })
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-grow max-w-full overflow-auto h-full max-h-full">
                        <div className="flex flex-col gap-3">
                            {/* Header */}
                            {!productsOnly && (
                                <>
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <h1 className="text-2xl font-bold">
                                            Іграшки
                                        </h1>
                                        <div className="flex items-center w-full xs:w-auto">
                                            <Button
                                                variant="outlined"
                                                className="md:hidden text-blue1 border-blue1 normal-case w-full xs:w-auto"
                                                onClick={() => {
                                                    appDispatch(
                                                        openModal(
                                                            modalTypes.FILTERS
                                                        )
                                                    );
                                                }}
                                                startIcon={
                                                    <SlidersHorizontal className="w-5 h-5" />
                                                }
                                                sx={{
                                                    "&:hover": {
                                                        borderColor: "#0F83B2",
                                                        backgroundColor:
                                                            "rgba(15, 131, 178, 0.04)",
                                                    },
                                                }}
                                            >
                                                <span>Фільтри</span>
                                            </Button>
                                            {sortConfig && (
                                                <div className="hidden md:flex justify-end max-w-full overflow-hidden w-full xs:w-auto">
                                                    <SortControl
                                                        currentSort={sort}
                                                        config={sortConfig}
                                                        onChange={(
                                                            field,
                                                            direction
                                                        ) => {
                                                            dispatch(
                                                                sortProducts({
                                                                    field,
                                                                    direction,
                                                                })
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {sortConfig && (
                                        <div className="md:hidden flex justify-end max-w-full overflow-hidden w-full xs:w-auto">
                                            <SortControl
                                                currentSort={sort}
                                                config={sortConfig}
                                                onChange={(
                                                    field,
                                                    direction
                                                ) => {
                                                    dispatch(
                                                        sortProducts({
                                                            field,
                                                            direction,
                                                        })
                                                    );
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        img={product.imageUrl}
                                        title={product.name}
                                        firstPrice={String(product.price)}
                                        discountPrice={String(product.discount)}
                                        rating={product.average_rating}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Filters */}
                <MobileFilters />
            </div>
        </div>
    );
}
