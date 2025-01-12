import { Prisma } from "@prisma/client";

export type OrderCreateInput = Prisma.ordersCreateInput & {
    products: {
        product_id: number;
        quantity: number;
        original_price: number | Prisma.Decimal;
        purchase_price: number | Prisma.Decimal;
        product_name: string;
        product_sku: string;
        subtotal: number | Prisma.Decimal;
        total: number | Prisma.Decimal;
    }[];
};
