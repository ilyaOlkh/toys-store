"use client";

import React from "react";
import { Button, Drawer, SwipeableDrawer, useMediaQuery } from "@mui/material";
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

    return (
        <SwipeableDrawer
            open={menuOpen}
            onClose={() => dispatch(closeModal())}
            anchor={!isSmallMobile ? "bottom" : "right"}
            disableSwipeToOpen={true}
            onOpen={() => {}}
        >
            <div className="bg-white size-full rounded-t-[1rem] sm:rounded-t-[0rem] relative">
                <div className="flex flex-col max-h-full">
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
                    <div className="flex flex-col p-4 gap-4 flex-auto overflow-auto">
                        {favoritesState.favorites.map((product) => (
                            <ProductCard
                                product={product}
                                variant={"favorites"}
                                productsState={{
                                    products: favoritesState.favoritesProducts,
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
                        {[...favoritesState.nowPending, ...favoritesState.queue]
                            .filter((item) => item.type !== "remove")
                            .map((item) => item.productId)
                            .map((item) => (
                                <span>завантаження...</span>
                            ))}
                    </div>
                </div>
            </div>
        </SwipeableDrawer>
    );
}
