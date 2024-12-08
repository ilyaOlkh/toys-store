"use client";

import React from "react";
import { ProductType } from "@/app/types/types";
import { ProductsStoreProvider } from "../ProductsContext";
import { SortDirection } from "@/app/types/filters";
import { ProductsContent } from "./ProductsListScreen";
import { SortTabs } from "./SortTabs";
import { ClientSortConfig } from "@/app/service/filters";

interface MainProductScreenProps {
    initialProducts: ProductType[];
    initialSortConfig: ClientSortConfig;
    initialSortingRuleSet: string;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
    limit?: number;
    offset?: number;
}

export default function MainProductScreen({
    initialProducts,
    initialSortConfig,
    initialSortingRuleSet,
    initialSort,
    limit,
    offset,
}: MainProductScreenProps) {
    return (
        <ProductsStoreProvider
            initialProducts={initialProducts}
            filters={[]}
            sortConfig={initialSortConfig}
            sortingRuleSet={initialSortingRuleSet}
            initialFilterValues={{}}
            initialSort={initialSort}
            limit={limit}
            offset={offset}
        >
            <div className="flex flex-col">
                <SortTabs />
                <ProductsContent productsOnly={true} />
            </div>
        </ProductsStoreProvider>
    );
}
