// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildWhereConditions } from "@/lib/products/filters";
import { buildOrderByConditions } from "@/lib/products/sorts";
import { getFilteredProducts } from "@/lib/products/getFilteredProducts";

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

        // Build query conditions
        const [whereConditions, orderByConditions] = await Promise.all([
            buildWhereConditions(filters),
            buildOrderByConditions(sort, sortingRuleSet),
        ]);

        // Get filtered products
        const { products, total } = await getFilteredProducts({
            whereConditions,
            orderByConditions,
            limit,
            offset,
        });

        return NextResponse.json({
            products,
            total,
            pagination: {
                limit,
                offset,
                currentCount: products.length,
            },
        });
    } catch (error) {
        console.error("Error processing filtered products request:", error);
        return NextResponse.json(
            { error: "Failed to fetch filtered products" },
            { status: 500 }
        );
    }
}
