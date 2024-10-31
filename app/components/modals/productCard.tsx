import React from "react";
import Image from "next/image";
import Price from "../price";
import { ProductType } from "@/app/types/types";
import { RootState } from "@/app/redux/store";
import { Button, IconButton } from "@mui/material";
import { Plus, Minus } from "lucide-react";
import { useAppSelector } from "@/app/redux/hooks";
import { selectActualItemQuantity } from "@/app/redux/cartSelectors";

export type ProductCardVariant = "favorites" | "cart";
export type ProductItemType = {
    product_id: number;
    quantity?: number;
};

type ProductCardProps = {
    product: ProductItemType;
    variant: ProductCardVariant;
    productsState: {
        products: ProductType[];
        queue: Array<{ type: string; productId: number; quantity?: number }>;
        nowPending: Array<{
            type: string;
            productId: number;
            quantity?: number;
        }>;
    };
    onRemove?: () => void;
    onQuantityChange?: (quantity: number) => void;
};

export const ProductCard = ({
    product,
    variant,
    productsState,
    onRemove,
    onQuantityChange,
}: ProductCardProps) => {
    const productInfo = productsState.products.find(
        (item: ProductType) => item.id === product.product_id
    );
    console.log(
        isAdding(productsState, product.product_id),
        product.product_id
    );
    if (isRemoving(productsState, product.product_id)) return null;
    if (isAdding(productsState, product.product_id)) {
        return (
            <div className="flex gap-2 justify-center border border-gray-200 rounded-xl p-4 min-h-[118px]">
                <Image
                    src="/loading.svg"
                    alt="loading"
                    height={80}
                    width={80}
                />
            </div>
        );
    }

    if (!productInfo) return <span>немає інформації про продукт</span>;

    const currentQuantity = useAppSelector((state) =>
        selectActualItemQuantity(state, product.product_id)
    );

    const handleQuantityChange = (delta: number) => {
        if (!onQuantityChange) return;
        const newQuantity = Math.max(1, currentQuantity + delta);
        onQuantityChange(newQuantity);
    };

    return (
        <div className="flex gap-2 justify-between border border-gray-200 rounded-xl xs:p-4">
            <div className="flex gap-2 w-full items-center">
                <div className="flex-shrink-0 flex-grow-0 basis-[90px] xs:border border-gray-300 p-1 rounded-xl">
                    <Image
                        src={productInfo.imageUrl}
                        alt="product img"
                        width={90}
                        height={90}
                        className="rounded-xl object-cover"
                    />
                </div>
                <div className="overflow-hidden flex flex-col size-full justify-between p-2 pl-0 xs:p-0 ">
                    <div className="flex gap-2 justify-between items-start">
                        <div className="text-ellipsis overflow-hidden">
                            <h3 className="font-medium text-gray-900 text-sm xs:text-base">
                                {productInfo.name}
                            </h3>
                        </div>

                        <Button
                            className="basis-4 flex justify-end items-start min-w-[24px] xs:min-w-[32px] p-1 xs:p-2"
                            sx={{
                                borderRadius: "9999px",
                            }}
                            onClick={onRemove}
                        >
                            <Image
                                src="/X.svg"
                                alt="remove"
                                width={12}
                                height={12}
                                className="w-3 h-3 xs:w-4 xs:h-4"
                            />
                        </Button>
                    </div>

                    <div className="flex justify-between xs:items-center gap-0 xs:gap-2 mt-2 flex-col xs:flex-row">
                        <div className="text-black">
                            <Price
                                firstPrice={`${productInfo.price}`}
                                discountPrice={`${productInfo.discount}`}
                                hideOriginalPrice={variant === "cart"}
                            />
                        </div>

                        {variant === "cart" && onQuantityChange && (
                            <div className="flex items-center xs:gap-2 self-end">
                                <IconButton
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={currentQuantity === 1}
                                    size="small"
                                    className="h-6 w-6"
                                >
                                    <Minus className="h-4 w-4" />
                                </IconButton>

                                <span className="min-w-[2rem] text-center text-sm xs:text-base">
                                    {currentQuantity}
                                </span>

                                <IconButton
                                    onClick={() => handleQuantityChange(1)}
                                    size="small"
                                    className="h-6 w-6"
                                >
                                    <Plus className="h-4 w-4" />
                                </IconButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const isRemoving = (
    productsState: ProductCardProps["productsState"],
    productId: number
) =>
    productsState.queue.some(
        (item) => item.type === "remove" && item.productId === productId
    ) ||
    productsState.nowPending.some(
        (item) => item.type === "remove" && item.productId === productId
    );

const isAdding = (
    productsState: ProductCardProps["productsState"],
    productId: number
) =>
    productsState.queue.some(
        (item) => item.type === "add" && item.productId === productId
    ) ||
    productsState.nowPending.some(
        (item) => item.type === "add" && item.productId === productId
    );

export default ProductCard;
