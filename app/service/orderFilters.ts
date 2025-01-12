"use server";

import { serverFilters, serverSorts } from "../constants/ordersSettings";
import { ActiveFilter, ClientFilter } from "../types/filters";
import { Prisma } from "@prisma/client";

/**
 * Получает фильтры без серверной логики для использования на клиенте
 */
export async function getClientFilters(): Promise<ClientFilter[]> {
    const clientFilters = [];

    for (const filter of serverFilters) {
        const { generateValues, buildQuery, ...clientFilter } = filter;

        if (generateValues) {
            const generatedValues = await generateValues();
            Object.assign(clientFilter, generatedValues);
        }

        clientFilters.push(clientFilter);
    }

    return clientFilters;
}

/**
 * Получает конфигурации сортировки без серверной логики для использования на клиенте
 */
export async function getClientSorts(): Promise<ClientSortConfig[]> {
    const clientSorts = [];

    for (const sort of serverSorts) {
        const clientOptions = sort.options.map(
            ({ buildQuery, ...clientOption }) => clientOption
        );

        const clientSort: ClientSortConfig = {
            name: sort.name,
            title: sort.title,
            options: clientOptions,
            defaultOption: sort.defaultOption,
            defaultDirection: sort.defaultDirection,
            allowDirectionChange: sort.allowDirectionChange ?? false,
        };

        clientSorts.push(clientSort);
    }

    return clientSorts;
}

/**
 * Дополнительный тип для клиентской конфигурации сортировки
 */
export type ClientSortOption = {
    field: string;
    label: string;
};

export type ClientSortConfig = {
    name: string;
    title: string;
    options: ClientSortOption[];
    defaultOption: string;
    defaultDirection: "asc" | "desc";
    allowDirectionChange?: boolean;
};
