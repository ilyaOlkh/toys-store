"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/forms/CheckoutForm";
import { useEffect, useMemo, useState } from "react";
import { CartItem } from "../redux/cartSlice";
import { ProductType } from "../types/types";
import { useAppSelector } from "../redux/hooks";
import { selectActiveCartItems } from "../redux/cartSelectors";
import Image from "next/image";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [isClient, setIsClient] = useState(false);
    const cartItems = useAppSelector(selectActiveCartItems);
    const cartProducts = useAppSelector((state) => state.cart.cartProducts);
    const user = useAppSelector((state) => state.user.user);
    const cartIsInit = useAppSelector((state) => state.cart.isInit);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const cartItemsWithProducts = useMemo(
        () =>
            cartItems
                .map((item) => {
                    const product = cartProducts.find(
                        (p) => p.id === item.product_id
                    );
                    if (!product) return null;
                    return {
                        ...product,
                        quantity: item.quantity,
                    };
                })
                .filter(
                    (item): item is ProductType & CartItem => item !== null
                ),
        [cartItems, cartProducts]
    );

    const createPaymentIntent = async (
        cartItems: (ProductType & CartItem)[]
    ) => {
        const items = cartItems.map((item) => ({
            price_data: {
                currency: "uah",
                product_data: {
                    name: item.name,
                    images: [item.imageUrl],
                    description: item.description,
                    metadata: {
                        product_id: String(item.id),
                        sku: item.sku_code,
                    },
                },
                unit_amount: Math.round(
                    Number(item.discount || item.price) * 100
                ),
            },
            quantity: item.quantity,
        }));

        const response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });

        return await response.json();
    };

    useEffect(() => {
        if (cartItemsWithProducts.length === 0) return;

        createPaymentIntent(cartItemsWithProducts)
            .then((data) => setClientSecret(data.clientSecret))
            .catch((error) => console.error("Payment Intent Error:", error));
    }, [cartItemsWithProducts]);

    if (!cartIsInit && !user) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Image
                    src="/loading.svg"
                    alt="Loading..."
                    width={80}
                    height={80}
                />
            </div>
        );
    }

    if (cartItemsWithProducts.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-xl text-gray1">Корзина пуста</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <div className="customContainer">
                {clientSecret && (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: "stripe",
                                labels: "floating",
                                variables: {
                                    colorPrimary: "#0F83B2",
                                },
                            },
                            locale: "auto",
                        }}
                    >
                        <CheckoutForm />
                    </Elements>
                )}
            </div>
        </div>
    );
}
