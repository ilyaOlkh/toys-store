"use client";
import Image from "next/image";
import Price from "./price";
import { Rating } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { addFavorite, removeFavorite } from "../redux/favoritesSlice";
import { addCartItem, removeCartItem } from "../redux/cartSlice";

interface ProductCardProps {
    id: number;
    img: string;
    title: string;
    firstPrice: string;
    discountPrice: string;
    rating: number;
}

export function ProductCard({
    id,
    img,
    title,
    firstPrice,
    discountPrice,
    rating,
}: ProductCardProps) {
    const dispatch = useAppDispatch();
    //вынести в хук
    const isFavorite = useAppSelector((store) => {
        const isInFavorites = store.favorites.favorites.some(
            (item) => item.product_id === id
        );
        const isInQueue = store.favorites.queue.find(
            (item) => item.productId === id
        );
        const isInNowPending = store.favorites.nowPending.find(
            (item) => item.productId === id
        );
        return isInQueue
            ? isInQueue.type === "add"
            : isInNowPending
            ? isInNowPending.type === "add"
            : isInFavorites;
    });
    const isInCart = useAppSelector((store) => {
        const isInCart = store.cart.cart.some((item) => item.product_id === id);
        const isInQueue = store.cart.queue.find(
            (item) => item.productId === id
        );
        const isInNowPending = store.cart.nowPending.find(
            (item) => item.productId === id
        );
        return isInQueue
            ? isInQueue.type === "add"
            : isInNowPending
            ? isInNowPending.type === "add"
            : isInCart;
    });

    const handleFavoriteToggle = () => {
        if (isFavorite) {
            dispatch(removeFavorite(id));
        } else {
            dispatch(addFavorite({ product_id: id }));
        }
    };

    const handleCartToggle = () => {
        if (isFavorite) {
            dispatch(removeCartItem(id));
        } else {
            dispatch(addCartItem({ product_id: id, quantity: 1 }));
        }
    };

    const handleAddToCart = () => {
        if (isInCart) {
            dispatch(removeCartItem(id));
        } else {
            dispatch(addCartItem({ product_id: id, quantity: 1 }));
        }
    };

    return (
        <div className="relative">
            <div className="absolute top-[1px] right-[1px] pt-1.5 pr-1.5 bg-white rounded-tr-3xl rounded-bl-3xl p-1 flex flex-col gap-2 items-center z-10 border-l border-b border-lightGray1">
                <div
                    className="p-1 cursor-pointer"
                    onClick={handleFavoriteToggle}
                >
                    <Image
                        src={
                            isFavorite
                                ? "/icons/heart-filled.png"
                                : "/icons/heart-outlined.png"
                        }
                        width={25}
                        height={25}
                        alt="heart"
                    />
                </div>
                <div className="p-1 cursor-pointer" onClick={handleAddToCart}>
                    <Image
                        src={
                            isInCart
                                ? "/icons/cart-filled.png"
                                : "/icons/cart-outlined.png"
                        }
                        width={25}
                        height={25}
                        alt="cart"
                    />
                </div>
            </div>
            <a
                className="flex flex-col h-full justify-between gap-3 relative"
                href={`/products/${id}`}
            >
                {+discountPrice > 0 && (
                    <div className="rounded-full bg-red1 font-semibold text-sm text-white absolute top-3 left-3 px-3 py-1">
                        ЗНИЖКА
                    </div>
                )}

                <div className="border-lightGray1 border size-full rounded-3xl p-2">
                    <Image
                        src={img}
                        width={400}
                        height={400}
                        alt="product img"
                        className="rounded-3xl"
                    />
                </div>
                <div>
                    <div>{title}</div>
                    <Price
                        firstPrice={firstPrice}
                        discountPrice={discountPrice}
                    />
                    <Rating value={rating} readOnly />
                </div>
            </a>
        </div>
    );
}
