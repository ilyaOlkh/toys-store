"use client";

import React from "react";
import { ProductType } from "@/app/types/types";
import { ProductCard } from "@/app/components/productCard";
import { ProductsStoreProvider, useProducts } from "../ProductsContext";
import { ClientFilter, SortConfig } from "@/app/types/filters";
import { FiltersList } from "./FiltersList";
import { filterProducts, sortProducts } from "@/app/redux/productsSlice";
import SortControl from "./SortSelect";

interface ProductsListScreenProps {
    initialProducts: ProductType[];
    initialFilters: ClientFilter[];
    initialSortConfig: SortConfig;
    initialSortingRuleSet: string;
}

export default function ProductsListScreen({
    initialProducts,
    initialFilters,
    initialSortConfig,
    initialSortingRuleSet,
}: ProductsListScreenProps) {
    return (
        <ProductsStoreProvider
            initialProducts={initialProducts}
            filters={initialFilters}
            sortConfig={initialSortConfig}
            sortingRuleSet={initialSortingRuleSet}
        >
            <ProductsContent />
        </ProductsStoreProvider>
    );
}

function ProductsContent() {
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
                    <div className="hidden md:block w-[240px] flex-shrink-0">
                        <div className="flex flex-col gap-6">
                            {/* Filters */}
                            <FiltersList
                                filterConfigs={filterConfigs}
                                filterValues={filterValues}
                                onFilterChange={(name, value) => {
                                    dispatch(filterProducts({ name, value }));
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold">Іграшки</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:text-blue1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 hover:text-blue1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                                            </svg>
                                        </button>
                                    </div>
                                    {sortConfig && (
                                        <SortControl
                                            config={sortConfig}
                                            onChange={(field, direction) => {
                                                dispatch(
                                                    sortProducts({
                                                        field,
                                                        direction,
                                                    })
                                                );
                                                console.log("Sort changed:", {
                                                    field,
                                                    direction,
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
            </div>
        </div>
    );
}
