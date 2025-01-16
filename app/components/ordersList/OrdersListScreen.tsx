"use client";

import React from "react";
import { OrdersStoreProvider, useOrders } from "../OrdersContext";
import { ClientFilter, FilterValue, SortDirection } from "@/app/types/filters";
import { FiltersList } from "../productsList/FiltersList";
import {
    filterOrders,
    setPaginationAndFetch,
    sortOrders,
    OrderType,
} from "@/app/redux/ordersSlice";
import SortControl from "../productsList/SortSelect";
import { ClientSortConfig } from "@/app/service/orderFilters";
import { Button, Pagination } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { useAppDispatch } from "@/app/redux/hooks";
import { openModal } from "@/app/redux/modalSlice";
import { modalTypes } from "@/app/constants/modal-constants";
import { OrderMobileFilters } from "../modals/OrderMobileFilters";
import OrderCard from "./OrderCard";

interface OrdersListScreenProps {
    initialOrders: OrderType[];
    initialFilters: ClientFilter[];
    initialSortConfig: ClientSortConfig;
    initialSortingRuleSet: string;
    initialFilterValues: Record<string, FilterValue>;
    initialSort: {
        field: string;
        direction: SortDirection;
    };
    limit?: number;
    offset?: number;
    total: number;
}

const ITEMS_PER_PAGE = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 12;

export default function OrdersListScreen({
    initialOrders,
    initialFilters,
    initialSortConfig,
    initialSortingRuleSet,
    initialFilterValues,
    initialSort,
    limit,
    offset,
    total,
}: OrdersListScreenProps) {
    return (
        <OrdersStoreProvider
            initialOrders={initialOrders}
            filters={initialFilters}
            sortConfig={initialSortConfig}
            sortingRuleSet={initialSortingRuleSet}
            initialFilterValues={initialFilterValues}
            initialSort={initialSort}
            limit={limit}
            offset={offset}
            total={total}
        >
            <OrdersContent />
        </OrdersStoreProvider>
    );
}

function OrdersContent() {
    const appDispatch = useAppDispatch();

    const {
        orders,
        filterValues,
        filterConfigs,
        sort,
        sortConfig,
        pagination,
        total,
        dispatch,
    } = useOrders();

    const numOfPages = Math.ceil((total ?? 0) / ITEMS_PER_PAGE);

    return (
        <div className="flex justify-center">
            <div className="customContainer">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="hidden md:block w-[240px] flex-shrink-0 max-h-full overflow-hidden">
                        <div className="flex flex-col gap-6">
                            {/* Filters */}
                            <FiltersList
                                filterConfigs={filterConfigs}
                                filterValues={filterValues}
                                onFilterChange={(name, value) => {
                                    dispatch(filterOrders({ name, value }));
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow max-w-full overflow-auto">
                        <div className="flex flex-col gap-3">
                            {/* Header */}
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <h1 className="text-2xl font-bold">
                                    Замовлення
                                </h1>
                                <div className="flex items-center w-full xs:w-auto">
                                    <div className="md:hidden w-full xs:w-auto">
                                        <Button
                                            variant="outlined"
                                            className="text-blue1 border-blue1 normal-case w-full xs:w-auto"
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
                                    </div>
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
                                                        sortOrders({
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
                                        onChange={(field, direction) => {
                                            dispatch(
                                                sortOrders({ field, direction })
                                            );
                                        }}
                                    />
                                </div>
                            )}

                            {/* Orders List */}
                            {orders.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {orders.map((order) => (
                                        <OrderCard order={order} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-20 text-4xl w-full text-blue1 font-bold flex items-center justify-center">
                                    Нет заказов
                                </div>
                            )}
                            {numOfPages > 1 && (
                                <div className="flex justify-center pt-8">
                                    <Pagination
                                        page={
                                            Math.floor(
                                                (pagination.offset ?? 0) /
                                                    ITEMS_PER_PAGE
                                            ) + 1
                                        }
                                        count={numOfPages}
                                        onChange={(_, page) => {
                                            dispatch(
                                                setPaginationAndFetch({
                                                    limit: ITEMS_PER_PAGE,
                                                    offset:
                                                        (page - 1) *
                                                        ITEMS_PER_PAGE,
                                                })
                                            );
                                        }}
                                        color="primary"
                                        shape="rounded"
                                        size="large"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile Filters */}
                <OrderMobileFilters />
            </div>
        </div>
    );
}
