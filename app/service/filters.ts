"use server";

import { serverFilters, serverSorts } from "../constants/filtersSettings";
import { ActiveFilter, ClientFilter } from "../types/filters";
import { Prisma } from "@prisma/client";

/**
 * Получает фильтры без серверной логики для использования на клиенте
 */

export async function getClientFilters(): Promise<ClientFilter[]> {
    const clientFilters = [];

    for (const filter of serverFilters) {
        const { prismaQuery, generateValues, computedFields, ...clientFilter } =
            filter;

        if (generateValues) {
            const generatedValues = await generateValues();
            Object.assign(clientFilter, generatedValues);
        }

        clientFilters.push(clientFilter);
    }

    return clientFilters;
}

/**
 * Строит Prisma запрос на основе активных фильтров
 * @param activeFilters - массив активных фильтров с их значениями
 */
export async function buildPrismaQuery(activeFilters: ActiveFilter[]) {
    const whereConditions = activeFilters
        .map(({ name, value }) => {
            const filter = serverFilters.find((f) => f.name === name);

            if (!filter?.prismaQuery || value === null) return null;

            // Проверяем тип фильтра и приводим значение к правильному типу
            switch (filter.type) {
                case "select":
                    return filter.prismaQuery(value as string);
                case "range":
                    return filter.prismaQuery(
                        value as { from: number; to: number }
                    );
                case "multi-select":
                    return filter.prismaQuery(value as string[]);
                case "toggle":
                    return filter.prismaQuery(value as boolean);
                default:
                    return null;
            }
        })
        .filter(
            (condition): condition is Prisma.productsWhereInput =>
                condition !== null
        );

    return whereConditions.length ? { AND: whereConditions } : {};
}

/**
 * Получает конфигурации сортировки без серверной логики для использования на клиенте
 */
export async function getClientSorts(): Promise<ClientSortConfig[]> {
    const clientSorts = [];

    for (const sort of serverSorts) {
        const clientOptions = sort.options.map(
            ({ prismaSort, computed, computedFields, sort, ...clientOption }) =>
                clientOption
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
