// app/lib/products/sorts.ts
import { SortDirection } from "@/app/types/filters";
import { serverSorts } from "@/app/constants/filtersSettings";
import { Prisma } from "@prisma/client";

async function computeSortFields(
    fields?: Array<{ compute: () => Promise<any> }>
) {
    if (!fields) return;
    for (const field of fields) {
        await field.compute();
    }
}

function getDefaultSort() {
    const defaultSort = serverSorts[0].options.find(
        (opt) => opt.field === serverSorts[0].defaultOption
    );
    return defaultSort?.prismaSort?.(serverSorts[0].defaultDirection);
}

export async function buildOrderByConditions(
    sort: { field: string; direction: SortDirection },
    sortingRuleSet: string
) {
    const orderByConditions: Prisma.productsOrderByWithRelationInput[] = [];

    const sortConfig = serverSorts.find((s) => s.name === sortingRuleSet);
    if (sortConfig) {
        const option = sortConfig.options.find(
            (opt) => opt.field === sort.field
        );

        if (option?.prismaSort) {
            if (option.computed) {
                await computeSortFields(option.computedFields);
            }
            orderByConditions.push(option.prismaSort(sort.direction));
        }
    }

    if (orderByConditions.length === 0) {
        const defaultSort = getDefaultSort();
        if (defaultSort) {
            orderByConditions.push(defaultSort);
        }
    }

    return orderByConditions;
}
