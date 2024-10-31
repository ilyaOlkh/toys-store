"use client";

import React from "react";
import { Button, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";
import { Comfortaa } from "next/font/google";
import { closeModal } from "../../redux/modalSlice";
import Image from "next/image";
import { ProductCard } from "./productCard";
import { removeFavorite } from "@/app/redux/favoritesSlice";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export default function FavoriteModal() {
    const dispatch = useDispatch<AppDispatch>();
    const menuOpen = useAppSelector(
        (state: RootState) => state.modal.openModal === "favorites"
    );
    const isSmallMobile = useMediaQuery("(min-width: 640px)");
    const favoritesState = useAppSelector(
        (state: RootState) => state.favorites
    );

    // Filter active favorites items (not queued for removal)
    const activeFavoriteItems = favoritesState.favorites.filter(
        (item) =>
            !favoritesState.queue.some(
                (queueItem) =>
                    queueItem.productId === item.product_id &&
                    queueItem.type === "remove"
            ) &&
            !favoritesState.nowPending.some(
                (pendingItem) =>
                    pendingItem.productId === item.product_id &&
                    pendingItem.type === "remove"
            )
    );

    // Check if items are being added to favorites
    const isAddingItems = [
        ...favoritesState.nowPending,
        ...favoritesState.queue,
    ].some((item) => item.type === "add");

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
                        Ваші Улюблені товари❤️
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

                    {(activeFavoriteItems.length > 0 || isAddingItems) && (
                        <div className="flex flex-col p-4 gap-4 flex-auto overflow-auto">
                            {favoritesState.favorites.map((product) => (
                                <ProductCard
                                    key={product.product_id}
                                    product={product}
                                    variant="favorites"
                                    productsState={{
                                        products:
                                            favoritesState.favoritesProducts,
                                        queue: favoritesState.queue,
                                        nowPending: favoritesState.nowPending,
                                    }}
                                    onRemove={() => {
                                        dispatch(
                                            removeFavorite(product.product_id)
                                        );
                                    }}
                                />
                            ))}
                            {[
                                ...favoritesState.nowPending,
                                ...favoritesState.queue,
                            ]
                                .filter((item) => item.type !== "remove")
                                .map((item) => (
                                    <div className="flex gap-2 justify-center border border-gray-200 rounded-xl p-4 min-h-[118px]">
                                        <Image
                                            src="/loading.svg"
                                            alt="loading"
                                            height={80}
                                            width={80}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}

                    {activeFavoriteItems.length === 0 && !isAddingItems && (
                        <div className="flex flex-col items-center justify-center flex-grow p-4 gap-3">
                            <div>
                                <Image
                                    src="/empty-favorites.svg"
                                    alt="empty-favorites"
                                    width={200}
                                    height={200}
                                />
                            </div>
                            <span className="text-xl text-center">
                                Список улюблених товарів порожній
                            </span>
                            <span className="text-gray-500 text-center">
                                Додайте товари до списку улюблених
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </SwipeableDrawer>
    );
}
