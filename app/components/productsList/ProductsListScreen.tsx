"use client";

import React from "react";
import { ProductType } from "@/app/types/types";
import { ProductCard } from "@/app/components/productCard";
import { ProductsStoreProvider, useProducts } from "../ProductsContext";
import { ClientFilter } from "@/app/types/filters";

const categories = [
    { id: "playsets", name: "Playsets" },
    { id: "control-toys", name: "Control Toys" },
    { id: "educational-toys", name: "Educational Toys" },
    { id: "eco-friendly", name: "Eco-Friendly Toys" },
    { id: "stuffed-toys", name: "Stuffed Toys" },
    { id: "type-1", name: "Type 1" },
    { id: "type-2", name: "Type 2" },
];

interface ProductsStoreProviderProps {
    initialProducts: ProductType[];
    initialFilters: ClientFilter[];
}

export default function ProductsListScreen({
    initialProducts,
    initialFilters,
}: ProductsStoreProviderProps) {
    return (
        <ProductsStoreProvider
            initialProducts={initialProducts}
            filters={initialFilters}
        >
            <ProductsContent />;
        </ProductsStoreProvider>
    );
}

function ProductsContent() {
    const {
        products,
        filterValues,
        filterConfigs,
        sort,
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
                            {/* Categories */}
                            <div className="border border-lightGray1 rounded-xl p-4">
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-bold">
                                        Product categories
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                className="flex items-center text-left hover:text-blue1"
                                            >
                                                <span className="text-xl pr-2">
                                                    +
                                                </span>
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="border border-lightGray1 rounded-xl p-4">
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-bold">
                                        Filter by price
                                    </h2>
                                    <input
                                        type="range"
                                        className="w-full"
                                        min="20"
                                        max="200"
                                        step="1"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray1">$20</span>
                                        <div className="h-px bg-gray1 flex-grow"></div>
                                        <span className="text-gray1">$200</span>
                                    </div>
                                    <button className="bg-blue1 text-white py-2 px-4 rounded-lg hover:bg-opacity-90">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold">
                                    Educational Toys
                                </h1>
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
                                    <select className="border border-lightGray1 rounded-lg px-4 py-2">
                                        <option>Default sorting</option>
                                        <option>
                                            Sort by price: low to high
                                        </option>
                                        <option>
                                            Sort by price: high to low
                                        </option>
                                        <option>Sort by popularity</option>
                                        <option>Sort by rating</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
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
