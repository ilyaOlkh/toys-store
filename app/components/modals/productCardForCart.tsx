import Image from "next/image";
import Price from "../price";
import { ProductType } from "@/app/types/types";
import { RootState } from "@/app/redux/store";
import { CartItemWithProduct } from "@/app/redux/cartSlice";
import { Button } from "@mui/material";
import { Minus, Plus } from "lucide-react";

export const CartProductCard = ({
    item,
    cartState,
    onRemove,
    onUpdateQuantity,
}: {
    item: CartItemWithProduct;
    cartState: RootState["cart"];
    onRemove?: () => void;
    onUpdateQuantity?: (quantity: number) => void;
}) => {
    const productInfo = item.product;

    if (isRemoving(cartState, productInfo.id)) return null;
    if (isAdding(cartState, productInfo.id))
        return <span>завантаження...</span>;
    if (isUpdating(cartState, productInfo.id)) return <span>оновлення...</span>;

    if (!productInfo) return <span>немає інформації про продукт</span>;

    const handleIncrement = () => {
        if (onUpdateQuantity) {
            onUpdateQuantity(item.quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (item.quantity > 1 && onUpdateQuantity) {
            onUpdateQuantity(item.quantity - 1);
        }
    };

    const totalPrice = productInfo.discount
        ? productInfo.discount * item.quantity
        : productInfo.price * item.quantity;

    return (
        <div className="flex gap-2 justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex gap-4 w-full">
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
                    <div className="flex gap-2 justify-between items-start">
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
                            onClick={onRemove}
                        >
                            <Image
                                src={"/X.svg"}
                                alt="cross"
                                width={15}
                                height={15}
                            />
                        </Button>
                    </div>
                    <div className="flex justify-between items-end w-full">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleDecrement}
                                disabled={item.quantity <= 1}
                                sx={{
                                    minWidth: "32px",
                                    padding: "8px",
                                    borderRadius: "9999px",
                                    backgroundColor: "#F5F5F5",
                                    "&:hover": {
                                        backgroundColor: "#E0E0E0",
                                    },
                                }}
                            >
                                <Minus size={16} />
                            </Button>
                            <span className="min-w-[40px] text-center">
                                {item.quantity}
                            </span>
                            <Button
                                onClick={handleIncrement}
                                sx={{
                                    minWidth: "32px",
                                    padding: "8px",
                                    borderRadius: "9999px",
                                    backgroundColor: "#F5F5F5",
                                    "&:hover": {
                                        backgroundColor: "#E0E0E0",
                                    },
                                }}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>
                        <div className="flex flex-col items-end">
                            <Price
                                firstPrice={`${
                                    productInfo.price * item.quantity
                                }`}
                                discountPrice={
                                    productInfo.discount
                                        ? `${totalPrice}`
                                        : undefined
                                }
                            />
                            {item.quantity > 1 && (
                                <span className="text-sm text-gray-500">
                                    {productInfo.discount
                                        ? `${productInfo.discount} за шт.`
                                        : `${productInfo.price} за шт.`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const isRemoving = (cartState: RootState["cart"], productId: number) =>
    cartState.queue.some(
        (item) => item.type === "remove" && item.productId === productId
    ) ||
    cartState.nowPending.some(
        (item) => item.type === "remove" && item.productId === productId
    );

const isAdding = (cartState: RootState["cart"], productId: number) =>
    cartState.queue.some(
        (item) => item.type === "add" && item.productId === productId
    ) ||
    cartState.nowPending.some(
        (item) => item.type === "add" && item.productId === productId
    );

const isUpdating = (cartState: RootState["cart"], productId: number) =>
    cartState.queue.some(
        (item) => item.type === "update" && item.productId === productId
    ) ||
    cartState.nowPending.some(
        (item) => item.type === "update" && item.productId === productId
    );

export default CartProductCard;
