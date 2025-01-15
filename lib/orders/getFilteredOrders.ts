import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface OrderQueryParams {
    whereConditions: Prisma.Sql;
    orderByConditions: Prisma.Sql;
    limit?: number;
    offset?: number;
}

export async function getFilteredOrders({
    whereConditions,
    orderByConditions,
    limit,
    offset,
}: OrderQueryParams) {
    const baseQuery = Prisma.sql`
        WITH product_images_agg AS (
            SELECT 
                pi.product_id,
                JSON_AGG(pi.image_blob) as images
            FROM product_images pi
            GROUP BY pi.product_id
        ),
        order_products AS (
            SELECT 
                op.order_id,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', op.id,
                        'product_id', op.product_id,
                        'product_name', op.product_name,
                        'product_sku', op.product_sku,
                        'quantity', op.quantity,
                        'purchase_price', op.purchase_price,
                        'original_price', op.original_price,
                        'subtotal', op.subtotal,
                        'total', op.total,
                        'images', COALESCE(pi.images, '[]')
                    )
                ) as products
            FROM order_products op
            LEFT JOIN product_images_agg pi ON op.product_id = pi.product_id
            GROUP BY op.order_id
        )
        SELECT 
            o.id,
            o.order_id,
            o.user_identifier,
            o.first_name,
            o.last_name,
            o.city,
            o.state,
            o.phone,
            o.email,
            o.payment_method,
            o.delivery_method,
            o.delivery_address,
            o.delivery_cost,
            o.paid,
            o.payment_date,
            o.notes,
            o.subtotal,
            o.total,
            o.status,
            o.created_at,
            COALESCE(op.products, '[]') as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        WHERE ${whereConditions}
        ORDER BY ${orderByConditions}
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
        ${offset ? Prisma.sql`OFFSET ${offset}` : Prisma.empty}
    `;

    const countQuery = Prisma.sql`
        SELECT COUNT(*) as total
        FROM orders o
        WHERE ${whereConditions}
    `;

    const [orders, totalResult] = await Promise.all([
        prisma.$queryRaw<any[]>(baseQuery),
        prisma.$queryRaw<[{ total: BigInt }]>(countQuery),
    ]);

    // Format orders if needed
    const formattedOrders = orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        total: Number(order.total),
        products: order.products.map((product: any) => ({
            ...product,
            purchase_price: Number(product.purchase_price),
            original_price: Number(product.original_price),
            subtotal: product.subtotal ? Number(product.subtotal) : null,
            total: product.total ? Number(product.total) : null,
            images: Array.isArray(product.images) ? product.images : [],
        })),
    }));

    return {
        orders: formattedOrders,
        total: Number(totalResult[0].total),
    };
}
