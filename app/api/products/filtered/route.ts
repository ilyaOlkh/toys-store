import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereConditions } from "@/lib/products/filters";
import { buildOrderByConditions } from "@/lib/products/sorts";
import { formatProducts } from "@/lib/products/format";
import { serverSorts } from "@/app/constants/filtersSettings";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Получаем и парсим параметры
        const filters = JSON.parse(searchParams.get("filters") || "{}");
        const sort = JSON.parse(searchParams.get("sort") || "{}");
        const sortingRuleSet = JSON.parse(
            searchParams.get("sortingRuleSet") || '""'
        );

        // Получаем условия фильтрации и сортировки
        const [whereConditions, orderByConditions] = await Promise.all([
            buildWhereConditions(filters),
            buildOrderByConditions(sort, sortingRuleSet),
        ]);

        // Получаем продукты
        const products = await prisma.products.findMany({
            where: whereConditions,
            orderBy: orderByConditions,
            include: {
                images: true,
                comments: true,
                discounts: true,
            },
        });

        // Форматируем и возвращаем результат
        let formattedProducts = formatProducts(products);

        if (sort && sortingRuleSet) {
            const sortConfig = serverSorts.find(
                (config) => config.name === sortingRuleSet
            );
            if (sortConfig) {
                const selectedSort = sortConfig.options.find(
                    (option) => option.field === sort.field
                );
                if (selectedSort?.sort) {
                    formattedProducts = formattedProducts.sort((a, b) =>
                        selectedSort.sort!(a, b, sort.direction)
                    );
                }
            }
        }

        return NextResponse.json({
            products: formattedProducts,
            total: formattedProducts.length,
            appliedFilters: whereConditions,
            appliedSorts: orderByConditions,
        });
    } catch (error) {
        console.error("Error processing filtered products request:", error);
        return NextResponse.json(
            { error: "Failed to fetch filtered products" },
            { status: 500 }
        );
    }
}
