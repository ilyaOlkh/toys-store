// lib/products/query.ts
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ProductQueryParams {
    whereConditions: Prisma.Sql;
    orderByConditions: Prisma.Sql;
    limit?: number;
    offset?: number;
}

export async function getFilteredProducts({
    whereConditions,
    orderByConditions,
    limit,
    offset,
}: ProductQueryParams) {
    // Base query for products with all necessary information
    const baseQuery = Prisma.sql`
        WITH product_ratings AS (
            SELECT 
                product_id,
                COALESCE(AVG(rating), 0) as avg_rating,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', id,
                        'user_identifier', user_identifier,
                        'comment', comment,
                        'rating', rating,
                        'created_at', created_at,
                        'edited_at', edited_at,
                        'edited_by', edited_by
                    ) ORDER BY created_at DESC
                ) as comments
            FROM comments
            GROUP BY product_id
        ),
        product_images AS (
            SELECT 
                product_id,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', id,
                        'product_id', product_id,
                        'image_blob', image_blob
                    )
                ) as images
            FROM product_images
            GROUP BY product_id
        ),
        product_discounts AS (
            SELECT 
                product_id,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', id,
                        'new_price', new_price,
                        'start_date', start_date,
                        'end_date', end_date
                    )
                ) as discounts
            FROM discounts
            WHERE start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP
            GROUP BY product_id
        )
        SELECT 
            p.id,
            p.name,
            p.price,
            p.discount,
            p.description,
            p.stock_quantity,
            p.sku_code,
            p.created_at,
            COALESCE(pr.avg_rating, 0) as average_rating,
            COALESCE(pr.comments, '[]') as comments,
            COALESCE(pi.images, '[]') as images,
            COALESCE(pd.discounts, '[]') as discounts
        FROM products p
        LEFT JOIN product_ratings pr ON p.id = pr.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN product_discounts pd ON p.id = pd.product_id
        WHERE ${whereConditions}
        ORDER BY ${orderByConditions}
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
        ${offset ? Prisma.sql`OFFSET ${offset}` : Prisma.empty}
    `;

    // Get total count
    const countQuery = Prisma.sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE ${whereConditions}
    `;

    const [products, totalResult] = await Promise.all([
        prisma.$queryRaw<any[]>(baseQuery),
        prisma.$queryRaw<[{ total: BigInt }]>(countQuery),
    ]);

    const productsWithImageUrl = products.map((product) => ({
        ...product,
        imageUrl:
            product.images.length > 0
                ? product.images[0].image_blob
                : "/noPhoto.png",
    }));

    return {
        products: productsWithImageUrl,
        total: Number(totalResult[0].total),
    };
}
