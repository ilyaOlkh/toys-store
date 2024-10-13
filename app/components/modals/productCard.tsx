import Image from "next/image";
import Price from "../price";
import { ProductType } from "@/app/types/types";
import { RootState } from "@/app/redux/store";
import { favorites } from "@prisma/client";
import { FavoriteItem } from "@/app/redux/favoritesSlice";
import { Button } from "@mui/material";

export const ProductCardModal = ({
    product,
    favoritesState,
    onClick,
}: {
    product: FavoriteItem;
    favoritesState: RootState["favorites"];
    onClick?: () => void;
}) => {
    const productInfo = favoritesState.favoritesProducts.find(
        (item: ProductType) => item.id === product.product_id
    );

    if (isRemoving(favoritesState, product.product_id)) return null;
    console.log({ ...favoritesState });
    if (isAdding(favoritesState, product.product_id))
        return <span>завантаження...</span>;

    if (!productInfo) return <span>немає інформації про продукт</span>;

    return (
        <div className="flex gap-2 justify-between">
            <div className="flex gap-2 w-full">
                <div className="flex-shrink-0 flex-grow-0 basis-[90px] border-[#D4D4D4] border p-1 rounded-[1.25rem]">
                    <Image
                        src={productInfo.imageUrl}
                        alt="product img"
                        width={90}
                        height={90}
                        className="rounded-[1.25rem]"
                    />
                </div>
                <div className="overflow-hidden flex flex-col w-full justify-between">
                    <div className="flex gap-2 justify-between items-center">
                        <div className="text-ellipsis text-nowrap overflow-hidden w-full">
                            {productInfo.name}
                        </div>
                        <Button
                            className="basis-4 flex justify-end items-start"
                            sx={{
                                minWidth: "32px",
                                padding: "8px",
                                borderRadius: "9999px",
                            }}
                            onClick={onClick}
                        >
                            <Image
                                src={"/X.svg"}
                                alt="cross"
                                width={15}
                                height={15}
                            />
                        </Button>
                    </div>
                    <div className="text-black self-end">
                        <Price
                            firstPrice={`${productInfo.price}`}
                            discountPrice={`${productInfo.discount}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const isRemoving = (
    favoritesState: RootState["favorites"],
    productId: number
) =>
    favoritesState.queue.some(
        (item) => item.type === "remove" && item.productId === productId
    ) ||
    favoritesState.nowPending.some(
        (item) => item.type === "remove" && item.productId === productId
    );

const isAdding = (favoritesState: RootState["favorites"], productId: number) =>
    favoritesState.queue.some(
        (item) => item.type === "add" && item.productId === productId
    ) ||
    favoritesState.nowPending.some(
        (item) => item.type === "add" && item.productId === productId
    );
