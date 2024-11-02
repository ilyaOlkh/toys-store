// components/FavoriteButton.tsx
"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { addFavorite, removeFavorite } from "@/app/redux/favoritesSlice";
import Image from "next/image";

interface FavoriteButtonProps {
    productId: number;
    className?: string;
}

const FavoriteButton = ({ productId, className = "" }: FavoriteButtonProps) => {
    const dispatch = useAppDispatch();

    const isFavorite = useAppSelector((store) => {
        const isInFavorites = store.favorites.favorites.some(
            (item) => item.product_id === productId
        );
        const isInQueue = store.favorites.queue.find(
            (item) => item.productId === productId
        );
        const isInNowPending = store.favorites.nowPending.find(
            (item) => item.productId === productId
        );
        return isInQueue
            ? isInQueue.type === "add"
            : isInNowPending
            ? isInNowPending.type === "add"
            : isInFavorites;
    });

    const handleFavoriteToggle = () => {
        if (isFavorite) {
            dispatch(removeFavorite(productId));
        } else {
            dispatch(addFavorite({ product_id: productId }));
        }
    };

    return (
        <div
            className={`p-2 cursor-pointer ${className} border rounded-lg`}
            onClick={handleFavoriteToggle}
        >
            <Image
                src={
                    isFavorite
                        ? "/icons/heart-filled.png"
                        : "/icons/heart-outlined.png"
                }
                width={32}
                height={32}
                alt="heart"
            />
        </div>
    );
};

export default FavoriteButton;
