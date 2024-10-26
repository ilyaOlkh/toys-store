"use client";

import React, { useState, useEffect } from "react";
import { Button, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";
import { closeModal } from "../../redux/modalSlice";
import Image from "next/image";
import { ProductCard } from "./productCard";
import { removeCartItem, updateCartItem } from "@/app/redux/cartSlice";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"] });

export default function CartModal() {
    const dispatch = useDispatch<AppDispatch>();
    const menuOpen = useAppSelector(
        (state: RootState) => state.modal.openModal === "cart"
    );
    const isSmallMobile = useMediaQuery("(min-width: 640px)");
    const cartState = useAppSelector((state: RootState) => state.cart);
    const { totalOriginal, totalWithDiscount } = {
        totalOriginal: 0,
        totalWithDiscount: 0,
    };

    return (
        <SwipeableDrawer
            open={menuOpen}
            onClose={() => dispatch(closeModal())}
            anchor={!isSmallMobile ? "bottom" : "right"}
            disableSwipeToOpen={true}
            onOpen={() => {}}
        >
            <div className="bg-white size-full rounded-t-[1rem] sm:rounded-t-[0rem] relative">
                <div className="flex flex-col h-full">
                    <h2 className="relative text-xl flex px-14 py-5 justify-center items-center w-full border-b text-center">
                        Кошик 🛒
                        <div className="absolute right-0 top-0 h-full rounded-tr-[1rem] overflow-hidden">
                            <Button
                                className="h-full"
                                onClick={() => dispatch(closeModal())}
                            >
                                <Image
                                    src={"/X.svg"}
                                    alt="cross"
                                    width={30}
                                    height={30}
                                />
                            </Button>
                        </div>
                    </h2>

                    <div className="flex flex-col p-4 gap-4 flex-auto overflow-auto">
                        {cartState.cart.map((cartItem) => (
                            <ProductCard
                                key={cartItem.product_id}
                                product={cartItem}
                                variant="cart"
                                productsState={{
                                    products: cartState.cartProducts,
                                    queue: cartState.queue,
                                    nowPending: cartState.nowPending,
                                }}
                                onRemove={() => {
                                    dispatch(
                                        removeCartItem(cartItem.product_id)
                                    );
                                }}
                                onQuantityChange={(quantity) => {
                                    dispatch(
                                        updateCartItem({
                                            productId: cartItem.product_id,
                                            quantity,
                                        })
                                    );
                                }}
                            />
                        ))}
                        {[...cartState.nowPending, ...cartState.queue]
                            .filter(
                                (item) =>
                                    item.type !== "remove" &&
                                    item.type !== "update"
                            )
                            .map((item) => (
                                <span key={item.productId}>
                                    завантаження...
                                </span>
                            ))}
                    </div>

                    {cartState.cart.length > 0 && (
                        <div className="border-t p-4 mt-auto">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-lg font-medium">
                                    Загальна сума:
                                </span>
                                {totalOriginal !== totalWithDiscount ? (
                                    <div
                                        className={
                                            poppins.className +
                                            " flex items-end gap-0 flex-col xs:flex-row xs:gap-2"
                                        }
                                    >
                                        <div className="font-semibold text-xl text-[#1BBF00]">
                                            {totalWithDiscount.toFixed(2)} ₴
                                        </div>
                                        <div className="font-medium text-sm text-[#898989] line-through xs:text-base">
                                            {totalOriginal.toFixed(2)} ₴
                                        </div>
                                    </div>
                                ) : (
                                    <span
                                        className={`${poppins.className} text-xl font-bold`}
                                    >
                                        {totalOriginal.toFixed(2)} ₴
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="contained"
                                fullWidth
                                className="bg-black hover:bg-gray-800 text-white py-3 rounded-full"
                                onClick={() => {
                                    console.log("Оформить заказ");
                                }}
                            >
                                Оформити замовлення
                            </Button>
                        </div>
                    )}

                    {cartState.cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center flex-grow p-4">
                            <span className="text-xl mb-2">Кошик порожній</span>
                            <span className="text-gray-500">
                                Додайте товари до кошика
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </SwipeableDrawer>
    );
}
