import { serverFilters } from "../constants/filtersSettings";
import { ActiveFilter, ClientFilter } from "../types/filters";
import { Prisma } from "@prisma/client";

/**
 * Получает фильтры без серверной логики для использования на клиенте
 */
export function getClientFilters(): ClientFilter[] {
    return serverFilters.map(
        ({ prismaQuery, ...clientFilter }) => clientFilter
    );
}

/**
 * Строит Prisma запрос на основе активных фильтров
 * @param activeFilters - массив активных фильтров с их значениями
 */
export function buildPrismaQuery(
    activeFilters: ActiveFilter[]
): Prisma.productsWhereInput {
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
