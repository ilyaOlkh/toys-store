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
        WITH order_products AS (
            SELECT 
                order_id,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', op.id,
                        'product_id', op.product_id,
                        'product_name', op.product_name,
                        'product_sku', op.product_sku,
                        'quantity', op.quantity,
                        'purchase_price', op.purchase_price,
                        'original_price', op.original_price
                    )
                ) as products
            FROM order_products op
            GROUP BY order_id
        )
        SELECT 
            o.id,
            o.user_identifier,
            o.first_name,
            o.last_name,
            o.street_address,
            o.city,
            o.state,
            o.zip_code,
            o.phone,
            o.email,
            o.payment_method,
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
        })),
    }));

    return {
        orders: formattedOrders,
        total: Number(totalResult[0].total),
    };
}
