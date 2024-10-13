"use client";

import React from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";
import { Comfortaa } from "next/font/google";
import { closeModal } from "../../redux/modalSlice";
import CompactProductCard from "../compactProductCard";
import Image from "next/image";
import Price from "../price";
import { ProductCardModal } from "./productCard";
import { removeFavorite } from "@/app/redux/favoritesSlice";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export default function FavoriteModal() {
    const dispatch = useDispatch<AppDispatch>();
    const menuOpen = useAppSelector(
        (state: RootState) => state.modal.openModal === "favorites"
    );
    const isMobile = useMediaQuery("(max-width: 768px)");
    const favoritesState = useAppSelector(
        (state: RootState) => state.favorites
    );

    return (
        <Drawer
            anchor="right"
            open={menuOpen}
            onClose={() => dispatch(closeModal())}
            sx={{
                width: 400,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 400,
                    boxSizing: "border-box",
                },
            }}
            className="block"
        >
            <div className="flex flex-col max-h-full">
                <h2 className="text-xl flex px-2 py-5 justify-center items-center w-full border-b">
                    Ваші Улюблені товари❤️
                </h2>
                <div className="flex flex-col p-4 gap-4 flex-auto overflow-auto">
                    {favoritesState.favorites.map((product) => (
                        <ProductCardModal
                            product={product}
                            favoritesState={favoritesState}
                            onClick={() => {
                                dispatch(removeFavorite(product.product_id));
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
        </Drawer>
    );
}
{
    /* <CompactProductCard
    imageUrl={result.imageUrl}
    name={result.name}
    price={result.price}
    discount={result.discount}
/>; */
}
