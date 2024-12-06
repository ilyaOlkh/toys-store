import { FilterValue } from "@/app/types/filters";
import { PrismaClient, Prisma } from "@prisma/client";
import { serverFilters } from "@/app/constants/filtersSettings";

const prisma = new PrismaClient();

async function processRawIdQuery(condition: any) {
    if (
        condition &&
        typeof condition === "object" &&
        "id" in condition &&
        condition.id &&
        typeof condition.id === "object" &&
        "in" in condition.id
    ) {
        const rawResults = await prisma.$queryRaw<{ id: number }[]>`
            ${condition.id.in}
        `;
        return { id: { in: rawResults.map((r) => r.id) } };
    }
    return condition;
}

export async function buildWhereConditions(
    filters: Record<string, FilterValue>
) {
    const activeFiltersPromises = Object.entries(filters).map(
        async ([name, value]) => {
            const config = serverFilters.find((f) => f.name === name);
            if (!config || value === config.defaultValue) return null;
            if (Array.isArray(value) && value.length === 0) return null;

            // Выполняем вычисляемые поля, если они есть
            if (config.computedFields) {
                for (const field of config.computedFields) {
                    await field.compute();
                }
            }

            const condition = await config.prismaQuery(value);
            return processRawIdQuery(condition);
        }
    );

    const activeFilters = (await Promise.all(activeFiltersPromises)).filter(
        (filter): filter is Prisma.productsWhereInput => filter !== null
    );

    return activeFilters.length > 0 ? { AND: activeFilters } : {};
}
