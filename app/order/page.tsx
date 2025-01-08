"use client";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";
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
                            locale: "auto",
                            appearance: {
                                theme: "flat",
                                variables: {
                                    colorPrimary: "#0F83B2",
                                    colorBackground: "#ffffff",
                                    colorText: "#1f2937",
                                    colorDanger: "#dc2626",
                                    fontFamily:
                                        '"Roboto", "Helvetica", "Arial", sans-serif',
                                    borderRadius: "4px",
                                    spacingUnit: "4px",
                                },
                                rules: {
                                    ".Input": {
                                        border: "2px solid #D4D4D4",
                                        boxShadow: "none",
                                        fontSize: "16px",
                                        padding: "16.5px 14px",
                                        transition:
                                            "border-color 0.2s ease-in-out",
                                    },
                                    ".Input:hover": {
                                        borderColor: "#0F83B2",
                                    },
                                    ".Input:focus": {
                                        borderColor: "#0F83B2",
                                        boxShadow: "0 0 0 1px #ffffff00",
                                    },
                                    ".Input--invalid": {
                                        borderColor: "#dc2626",
                                    },
                                    ".Label": {
                                        color: "rgba(0, 0, 0, 0.6)",
                                        fontSize: "14px",
                                    },
                                    ".Tab": {
                                        border: "2px solid #D4D4D4",
                                        borderRadius: "4px",
                                    },
                                    ".Tab:hover": {
                                        color: "#0F83B2",
                                        borderColor: "#0F83B2",
                                    },
                                    ".Tab--selected": {
                                        color: "#0F83B2",
                                        borderColor: "#0F83B2",
                                        backgroundColor:
                                            "rgba(15, 131, 178, 0.1)",
                                    },
                                    ".Select": {
                                        border: "2px solid #D4D4D4",
                                        borderRadius: "4px",
                                    },
                                    ".SelectIcon": {
                                        color: "#1f2937",
                                    },
                                    ".PaymentMethodItem": {
                                        border: "2px solid #D4D4D4",
                                        borderRadius: "4px",
                                        transition: "all 0.2s ease",
                                    },
                                    ".PaymentMethodItem:hover": {
                                        borderColor: "#0F83B2",
                                        backgroundColor:
                                            "rgba(15, 131, 178, 0.05)",
                                    },
                                    ".PaymentMethodItem--selected": {
                                        borderColor: "#0F83B2",
                                        backgroundColor:
                                            "rgba(15, 131, 178, 0.1)",
                                    },
                                    // Google Pay стилизация
                                    ".GooglePayButton": {
                                        borderRadius: "4px",
                                        transition: "opacity 0.2s ease",
                                    },
                                    ".GooglePayButton:hover": {
                                        opacity: "0.9",
                                    },
                                },
                            },
                        }}
                    >
                        <CheckoutForm />
                    </Elements>
                )}
            </div>
        </div>
    );
}

export const createPaymentIntent = async (
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
            unit_amount: Math.round(Number(item.discount || item.price) * 100),
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
