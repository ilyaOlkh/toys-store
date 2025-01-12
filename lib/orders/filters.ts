import { Prisma } from "@prisma/client";
import { serverFilters } from "@/app/constants/ordersSettings";
import { FilterValue } from "@/app/types/filters";

export async function buildWhereConditions(
    filters: Record<string, FilterValue>
): Promise<Prisma.Sql> {
    const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];

    for (const [name, value] of Object.entries(filters)) {
        // Специальная обработка для user_identifier
        if (name === "user_identifier") {
            conditions.push(Prisma.sql`o.user_identifier = ${value}`);
            continue;
        }

        const config = serverFilters.find((f) => f.name === name);
        if (!config || value === config.defaultValue) continue;
        if (Array.isArray(value) && value.length === 0) continue;

        const { rawQuery } = config.buildQuery(value);
        conditions.push(rawQuery);
    }

    return Prisma.sql`(${Prisma.join(conditions, " AND ")})`;
}
