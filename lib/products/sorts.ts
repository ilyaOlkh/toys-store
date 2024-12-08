import { serverSorts } from "@/app/constants/filtersSettings";
import { SortDirection } from "@/app/types/filters";
import { Prisma } from "@prisma/client";

export function buildOrderByConditions(
    sort: { field: string; direction: SortDirection },
    sortingRuleSet: string
): Prisma.Sql {
    const orderClauses: Prisma.Sql[] = [];

    // Add main sort
    const sortConfig = serverSorts.find((s) => s.name === sortingRuleSet);
    if (sortConfig) {
        const option = sortConfig.options.find(
            (opt) => opt.field === sort.field
        );
        if (option) {
            orderClauses.push(option.buildQuery());
        }
    }

    // Add default sort if no sort specified
    if (orderClauses.length === 0) {
        const defaultConfig = serverSorts[0];
        const defaultOption = defaultConfig.options.find(
            (opt) => opt.field === defaultConfig.defaultOption
        );
        if (defaultOption) {
            orderClauses.push(defaultOption.buildQuery());
        }
    }

    return Prisma.sql`${Prisma.join(orderClauses, ", ")}`;
}
