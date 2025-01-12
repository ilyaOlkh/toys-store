"use client";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/forms/CheckoutForm";
import { useEffect, useMemo, useState } from "react";
import { CartItem, removeCartItem, updateCartItem } from "../redux/cartSlice";
import { ProductType } from "../types/types";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    selectActiveCartItems,
    selectCartTotals,
} from "../redux/cartSelectors";
import Image from "next/image";
import { createPaymentIntent } from "../utils/fetch";
import ProductCard from "../components/modals/productCard";
import { Poppins } from "next/font/google";
import { Divider } from "@mui/material";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"] });

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [isClient, setIsClient] = useState(false);
    const cartItems = useAppSelector(selectActiveCartItems);
    const cartProducts = useAppSelector((state) => state.cart.cartProducts);
    const user = useAppSelector((state) => state.user.user);
    const cartIsInit = useAppSelector((state) => state.cart.isInit);

    const dispatch = useAppDispatch();
    const cartState = useAppSelector((state) => state.cart);
    const { totalOriginal, totalWithDiscount } =
        useAppSelector(selectCartTotals);

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
                <div className="flex flex-col md:flex-row-reverse gap-8">
                    {/* Секция корзины */}
                    <div className="md:w-5/12 lg:w-1/3">
                        <div className="sticky md:top-[9.25rem]">
                            <div className="rounded-xl border border-lightGray1">
                                <h2 className="text-xl px-3 sm:px-6 py-4 sm:py-5 border-b">
                                    Ваше замовлення 🛒
                                </h2>

                                <div className="flex flex-col gap-2">
                                    {cartItems.map((cartItem) => (
                                        <>
                                            <div className="p-2 sm:p-4">
                                                <ProductCard
                                                    key={cartItem.product_id}
                                                    product={cartItem}
                                                    variant="minimal"
                                                    productsState={{
                                                        products: cartProducts,
                                                        queue: cartState.queue,
                                                        nowPending:
                                                            cartState.nowPending,
                                                    }}
                                                    onRemove={() => {
                                                        dispatch(
                                                            removeCartItem(
                                                                cartItem.product_id
                                                            )
                                                        );
                                                    }}
                                                    onQuantityChange={(
                                                        quantity
                                                    ) => {
                                                        dispatch(
                                                            updateCartItem({
                                                                productId:
                                                                    cartItem.product_id,
                                                                quantity,
                                                            })
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <Divider />
                                        </>
                                    ))}

                                    <div className="flex justify-between items-start p-2 pt-0 sm:p-4 sm:pt-2 gap-1">
                                        <span className="text-lg font-medium text-nowrap">
                                            Загальна сума:
                                        </span>
                                        <div className={poppins.className}>
                                            {totalOriginal !==
                                            totalWithDiscount ? (
                                                <div className="flex items-end gap-2 flex-col xs:flex-row flex-wrap justify-end gap-y-0">
                                                    <div className="font-semibold text-xl text-[#1BBF00]">
                                                        {totalWithDiscount.toFixed(
                                                            2
                                                        )}{" "}
                                                        ₴
                                                    </div>
                                                    <div className="font-medium text-sm text-[#898989] line-through xs:text-base">
                                                        {totalOriginal.toFixed(
                                                            2
                                                        )}{" "}
                                                        ₴
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xl font-bold">
                                                    {totalOriginal.toFixed(2)} ₴
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:flex-1">
                        {clientSecret && (
                            <Elements
                                stripe={stripePromise}
                                options={{
                                    clientSecret,
                                    locale: "auto",
                                }}
                            >
                                <CheckoutForm />
                            </Elements>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
