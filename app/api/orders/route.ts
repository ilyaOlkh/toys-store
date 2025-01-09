// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderCreateInput } from "@/app/constants/orderConstants";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const orderData: OrderCreateInput = await request.json();
        console.log(orderData.payment_method);
        const order = await prisma.orders.create({
            data: {
                user_identifier: orderData.user_identifier,
                first_name: orderData.first_name,
                last_name: orderData.last_name,
                street_address: orderData.street_address,
                city: orderData.city,
                state: orderData.state,
                zip_code: orderData.zip_code,
                phone: orderData.phone,
                email: orderData.email,
                payment_method: orderData.payment_method,
                notes: orderData.notes,
                subtotal: orderData.subtotal,
                total: orderData.total,
                products: {
                    create: orderData.products.map((product) => ({
                        product_id: product.product_id,
                        quantity: product.quantity,
                        original_price: product.original_price,
                        purchase_price: product.purchase_price,
                        product_name: product.product_name,
                        product_sku: product.product_sku,
                    })),
                },
            },
            include: {
                products: true,
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
