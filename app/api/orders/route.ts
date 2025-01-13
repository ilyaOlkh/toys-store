import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderCreateInput } from "@/app/constants/orderConstants";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const orderData: OrderCreateInput = await request.json();

        const order = await prisma.orders.create({
            data: {
                order_id: orderData.order_id,
                user_identifier: orderData.user_identifier,
                first_name: orderData.first_name,
                last_name: orderData.last_name,
                city: orderData.city,
                state: orderData.state,
                phone: orderData.phone,
                email: orderData.email,
                payment_method: orderData.payment_method,
                delivery_method: orderData.delivery_method,
                delivery_address: orderData.delivery_address,
                delivery_cost: orderData.delivery_cost,
                paid: orderData.paid,
                payment_date: orderData.payment_date,
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
                status: "pending",
            },
            include: {
                products: true,
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to create order: ${error.message}` },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
