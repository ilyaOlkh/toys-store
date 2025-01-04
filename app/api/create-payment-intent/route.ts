import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@auth0/nextjs-auth0";
import { ProductType } from "@/app/types/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

interface CartItem {
    price_data: {
        currency: string;
        product_data: {
            name: string;
            images?: string[];
            description?: string;
            metadata: {
                product_id: string;
                sku: string;
            };
        };
        unit_amount: number;
    };
    quantity: number;
}

export async function POST(request: Request) {
    try {
        // Получаем сессию, но не требуем её
        const session = await getSession();

        // Получаем данные о товарах
        const { items } = (await request.json()) as {
            items: (ProductType & CartItem)[];
        };

        if (!items?.length) {
            return NextResponse.json(
                { error: "No items provided" },
                { status: 400 }
            );
        }

        // Вычисляем общую сумму
        const amount = items.reduce(
            (sum, item) => sum + item.price_data.unit_amount * item.quantity,
            0
        );

        // Создаём уникальный ID заказа
        const orderId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Собираем информацию о заказе для метаданных
        const orderMetadata = {
            order_id: orderId,
            items_count: String(items.length),
            products: JSON.stringify(
                items.map((item) => ({
                    id: item.price_data.product_data.metadata.product_id,
                    sku: item.price_data.product_data.metadata.sku,
                    quantity: item.quantity,
                    amount: item.price_data.unit_amount,
                }))
            ),
            // Добавляем информацию о пользователе только если он авторизован
            ...(session?.user && {
                user_id: session.user.sub,
                user_email: session.user.email,
            }),
        };

        // Создаём Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "uah",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: orderMetadata,
            // Добавляем email для чека только если пользователь авторизован
            ...(session?.user?.email && {
                receipt_email: session.user.email,
            }),
            description: `Замовлення #${orderId}`,
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            orderId,
            amount,
        });
    } catch (error) {
        console.error("[PAYMENT_INTENT]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
