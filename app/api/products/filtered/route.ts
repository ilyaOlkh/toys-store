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

        const filters = JSON.parse(searchParams.get("filters") || "{}");
        const sort = JSON.parse(searchParams.get("sort") || "{}");
        const sortingRuleSet = JSON.parse(
            searchParams.get("sortingRuleSet") || '""'
        );

        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit")!)
            : undefined;
        const offset = searchParams.get("offset")
            ? parseInt(searchParams.get("offset")!)
            : undefined;

        const [whereConditions, orderByConditions] = await Promise.all([
            buildWhereConditions(filters),
            buildOrderByConditions(sort, sortingRuleSet),
        ]);

        const products = await prisma.products.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                discount: true,
                description: true,
                stock_quantity: true,
                sku_code: true,
                created_at: true,
                images: {
                    select: {
                        id: true,
                        product_id: true,
                        image_blob: true,
                    },
                },
                comments: {
                    select: {
                        id: true,
                        user_identifier: true,
                        comment: true,
                        rating: true,
                        created_at: true,
                        edited_at: true,
                        edited_by: true,
                    },
                },
                discounts: {
                    select: {
                        id: true,
                        new_price: true,
                        start_date: true,
                        end_date: true,
                    },
                },
            },
            where: whereConditions,
            orderBy: orderByConditions,
            ...(limit !== undefined && { take: limit }),
            ...(offset !== undefined && { skip: offset }),
        });

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
            pagination: {
                limit,
                offset,
                currentCount: formattedProducts.length,
            },
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
